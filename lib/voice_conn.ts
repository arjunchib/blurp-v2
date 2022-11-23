import {
  GatewayDispatchEvents,
  GatewayOpcodes,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
  VoiceOpcodes,
} from "./deps.ts";
import { WebmOpusDemuxer } from "./audio/mod.ts";
import { DiscoClient } from "./client.ts";
import { VoiceWsConn } from "./voice_ws_conn.ts";
import {
  VoiceConnState,
  VoiceReadyPayload,
  VoiceSessionDescription,
} from "./voice_models.ts";
import { VoiceUdpConn } from "./voice_udp_conn.ts";

const SUPPORTED_ENCRYPTION_MODES = [
  "xsalsa20_poly1305_lite",
  "xsalsa20_poly1305_suffix",
  "xsalsa20_poly1305",
];

export class VoiceConn {
  private connected: Promise<void>;
  private connectedResolve?: (value: void | PromiseLike<void>) => void;
  private state: VoiceConnState;

  constructor(private client: DiscoClient, private guildId: string) {
    this.state = {
      nonce: 0,
      guildId,
    };
    this.connected = new Promise((resolve) => {
      this.connectedResolve = resolve;
    });
  }

  async connect(channelId: string) {
    this.listenGatewayEvents();
    this.sendVoiceStateUpdate(channelId);
    return await this.connected;
  }

  private sendVoiceStateUpdate(channelId: string) {
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
    const voiceStateUpdateHandler = (
      payload: GatewayVoiceStateUpdateDispatch
    ) => {
      if (payload.d.guild_id !== this.state.guildId) return;
      this.state.sessionId = payload.d.session_id;
      this.client.gateway.events.removeEventListener(
        GatewayDispatchEvents.VoiceStateUpdate,
        voiceStateUpdateHandler
      );
    };
    this.client.gateway.events.addEventListener(
      GatewayDispatchEvents.VoiceStateUpdate,
      voiceStateUpdateHandler
    );
    const voiceServerUpdateHandler = (
      payload: GatewayVoiceServerUpdateDispatch
    ) => {
      if (payload.d.guild_id !== this.state.guildId) return;
      this.state.endpoint = payload.d.endpoint || undefined;
      this.state.token = payload.d.token;
      this.state.ws = new VoiceWsConn(this.state);
      this.listenWsEvents();
      this.client.gateway.events.removeEventListener(
        GatewayDispatchEvents.VoiceStateUpdate,
        voiceServerUpdateHandler
      );
    };
    this.client.gateway.events.addEventListener(
      GatewayDispatchEvents.VoiceServerUpdate,
      voiceServerUpdateHandler
    );
  }

  private listenWsEvents() {
    if (!this.state.ws) throw new Error("Websocket not setup");
    this.state.ws.events.addEventListener(
      VoiceOpcodes.Ready,
      async (payload: VoiceReadyPayload) => {
        this.chooseEncryptionMode(payload.d.modes);
        this.state.ssrc = payload.d.ssrc;
        this.state.destAddr = {
          transport: "udp",
          port: payload.d.port,
          hostname: payload.d.ip,
        };
        this.state.udp = new VoiceUdpConn(this.state);
        const { address, port } = await this.state.udp.discoverIp();
        this.state.ws?.selectProtocol(address, port);
      }
    );
    this.state.ws?.events.addEventListener(
      VoiceOpcodes.SessionDescription,
      (payload: VoiceSessionDescription) => {
        this.state.encryptionMode = payload.d.mode;
        this.state.secretKey = new Uint8Array(payload.d.secret_key);
        console.log(`Mode is`, this.state.encryptionMode);
        console.log(`Secret key is`, this.state.secretKey);
        this.connectedResolve?.();
      }
    );
  }

  private chooseEncryptionMode(options: string[]) {
    this.state.encryptionMode = options.find((option) =>
      SUPPORTED_ENCRYPTION_MODES.includes(option)
    );
  }

  playAudioStream(stream: ReadableStream<Uint8Array>) {
    return new Promise<void>((resolve) => {
      this.state.ws?.sendSpeaking(true);
      const rs = stream.pipeThrough(WebmOpusDemuxer);
      const reader = rs.getReader();
      const intervalId = setInterval(async () => {
        const chunk = await reader.read();
        if (chunk.done) {
          clearInterval(intervalId);
          this.state.ws?.sendSpeaking(false);
          resolve();
          return;
        }
        this.state.udp?.sendAudioPacket(chunk.value);
        console.log(`[audio] Sent packet ${this.state.destAddr?.hostname}`);
      }, 20);
    });
  }
}
