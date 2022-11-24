import {
  GatewayDispatchEvents,
  GatewayOpcodes,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
} from "./deps.ts";
import { WebmOpusDemuxer } from "./audio/mod.ts";
import { DiscoClient } from "./client.ts";
import { VoiceWsConn } from "./voice_ws_conn.ts";
import { VoiceConnState } from "./voice_models.ts";

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

  constructor(private client: DiscoClient, private guildId: string) {
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
    this.client.gateway.events.removeEventListener(
      GatewayDispatchEvents.VoiceStateUpdate,
      this.voiceServerUpdateHandler!
    );
    this.client.gateway.events.removeEventListener(
      GatewayDispatchEvents.VoiceServerUpdate,
      this.voiceServerUpdateHandler!
    );
    this.status = "closed";
    this.state.udp?.close();
    this.state.ws?.close();
    this.sendVoiceStateUpdate(null);
  }

  private sendVoiceStateUpdate(channelId: string | null) {
    this.client.gateway.send({
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
      this.client.gateway.events.removeEventListener(
        GatewayDispatchEvents.VoiceStateUpdate,
        this.voiceStateUpdateHandler!
      );
    };
    this.client.gateway.events.addEventListener(
      GatewayDispatchEvents.VoiceStateUpdate,
      this.voiceStateUpdateHandler
    );
    this.voiceServerUpdateHandler = (
      payload: GatewayVoiceServerUpdateDispatch
    ) => {
      if (payload.d.guild_id !== this.state.guildId) return;
      this.state.endpoint = payload.d.endpoint || undefined;
      this.state.token = payload.d.token;
      this.state.ws = new VoiceWsConn(this.state);
      this.client.gateway.events.removeEventListener(
        GatewayDispatchEvents.VoiceServerUpdate,
        this.voiceServerUpdateHandler!
      );
    };
    this.client.gateway.events.addEventListener(
      GatewayDispatchEvents.VoiceServerUpdate,
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
