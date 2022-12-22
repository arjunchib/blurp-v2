import {
  GatewayOpcodes,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
} from "../deps.ts";
import { WebmOpusDemuxer } from "../audio/mod.ts";
import { VoiceWsConn } from "./voice_ws_conn.ts";
import { VoiceConnState } from "./voice_models.ts";
import { Gateway } from "./gateway.ts";

export class VoiceConn {
  private connected: Promise<void>;
  private state: VoiceConnState;
  private intervalId?: number;
  private voiceStateUpdateHandler?: (
    payload: GatewayVoiceStateUpdateDispatch
  ) => void;
  private voiceServerUpdateHandler?: (
    payload: GatewayVoiceServerUpdateDispatch
  ) => void;
  status: "open" | "closed" = "open";

  constructor(private gateway: Gateway, private guildId: string) {
    this.state = {
      nonce: 0,
      guildId,
    };
    this.connected = new Promise((resolve) => {
      this.state.connectedResolve = resolve;
    });
  }

  async connect(channelId: string) {
    this.listenGatewayEvents();
    this.sendVoiceStateUpdate(channelId);
    return await this.connected;
  }

  disconnect() {
    clearInterval(this.intervalId);
    this.gateway.events.removeEventListener(
      "DISPATCH_VOICE_STATE_UPDATE",
      this.voiceServerUpdateHandler!
    );
    this.gateway.events.removeEventListener(
      "DISPATCH_VOICE_SERVER_UPDATE",
      this.voiceServerUpdateHandler!
    );
    this.status = "closed";
    this.state.udp?.close();
    this.state.ws?.close();
    this.sendVoiceStateUpdate(null);
  }

  private sendVoiceStateUpdate(channelId: string | null) {
    this.gateway.send({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: {
        self_deaf: false,
        self_mute: false,
        guild_id: this.guildId,
        channel_id: channelId,
      },
    });
  }

  private listenGatewayEvents() {
    this.voiceStateUpdateHandler = (
      payload: GatewayVoiceStateUpdateDispatch
    ) => {
      if (payload.d.guild_id !== this.state.guildId) return;
      this.state.sessionId = payload.d.session_id;
      this.gateway.events.removeEventListener(
        "DISPATCH_VOICE_STATE_UPDATE",
        this.voiceStateUpdateHandler!
      );
    };
    this.gateway.events.addEventListener(
      "DISPATCH_VOICE_STATE_UPDATE",
      this.voiceStateUpdateHandler
    );
    this.voiceServerUpdateHandler = (
      payload: GatewayVoiceServerUpdateDispatch
    ) => {
      if (payload.d.guild_id !== this.state.guildId) return;
      this.state.endpoint = payload.d.endpoint || undefined;
      this.state.token = payload.d.token;
      this.state.ws = new VoiceWsConn(this.state);
      this.gateway.events.removeEventListener(
        "DISPATCH_VOICE_SERVER_UPDATE",
        this.voiceServerUpdateHandler!
      );
    };
    this.gateway.events.addEventListener(
      "DISPATCH_VOICE_SERVER_UPDATE",
      this.voiceServerUpdateHandler
    );
  }

  playAudioStream(stream: ReadableStream<Uint8Array>) {
    return new Promise<void>((resolve) => {
      this.state.ws?.sendSpeaking(true);
      const rs = stream.pipeThrough(new WebmOpusDemuxer());
      const reader = rs.getReader();
      this.intervalId = setInterval(async () => {
        const chunk = await reader.read();
        if (chunk.done) {
          clearInterval(this.intervalId);
          this.state.ws?.sendSpeaking(false);
          reader.releaseLock();
          resolve();
          return;
        }
        this.state.udp?.sendAudioPacket(chunk.value);
        // console.log(`[audio] Sent packet ${this.state.destAddr?.hostname}`);
      }, 15);
    });
  }
}
