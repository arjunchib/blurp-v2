import { VoiceOpcodes } from "../deps.ts";
import { environment } from "../environment.ts";
import {
  VoiceConnState,
  VoiceHelloPayload,
  VoicePayload,
  VoiceReadyPayload,
  VoiceSessionDescriptionPayload,
} from "./voice_models.ts";
import { VoiceUdpConn } from "./voice_udp_conn.ts";

const SUPPORTED_ENCRYPTION_MODES = [
  "xsalsa20_poly1305_lite",
  "xsalsa20_poly1305_suffix",
  "xsalsa20_poly1305",
];

export class VoiceWsConn {
  private ws!: WebSocket;
  private heartbeatIntervalId?: number;

  constructor(private state: VoiceConnState) {
    if (!state.endpoint) {
      throw new Error("No endpoint from gateway");
    }
    this.ws = new WebSocket(`wss://${this.state.endpoint}`);
    this.ws.addEventListener("open", () => {
      this.identify();
    });
    this.ws.addEventListener("message", async (event) => {
      await this.handleMessage(JSON.parse(event.data));
    });
    this.ws.addEventListener("close", (event) => {
      console.log(`[voice] Closed connection ${event.code} ${event.reason}`);
    });
  }

  close() {
    clearInterval(this.heartbeatIntervalId);
    this.ws.close();
  }

  sendSpeaking(speaking: boolean) {
    this.send({
      op: 5,
      d: {
        speaking: speaking ? 1 : 0,
        delay: 0,
        ssrc: this.state.ssrc,
      },
    });
  }

  selectProtocol(address: string, port: number) {
    console.log({
      address,
      port,
      mode: this.state.encryptionMode,
    });
    this.send({
      op: 1,
      d: {
        protocol: "udp",
        data: {
          address,
          port,
          mode: this.state.encryptionMode,
        },
      },
    });
  }

  // deno-lint-ignore no-explicit-any
  private send(payload: any) {
    console.log("[voice] Sent", VoiceOpcodes[payload.op]);
    this.ws?.send?.(JSON.stringify(payload));
  }

  private identify() {
    this.send({
      op: VoiceOpcodes.Identify,
      d: {
        server_id: this.state.guildId,
        user_id: environment.applicationId,
        session_id: this.state.sessionId,
        token: this.state.token,
      },
    });
  }

  private async handleMessage(payload: VoicePayload) {
    console.log("[voice] Received", VoiceOpcodes[payload.op]);
    switch (payload.op) {
      case VoiceOpcodes.Hello:
        this.setupHeartbeat(payload);
        break;
      case VoiceOpcodes.Ready:
        await this.onReady(payload);
        break;
      case VoiceOpcodes.SessionDescription:
        this.onSessionDescription(payload);
        break;
    }
  }

  private async onReady(payload: VoiceReadyPayload) {
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

  onSessionDescription(payload: VoiceSessionDescriptionPayload) {
    this.state.encryptionMode = payload.d.mode;
    this.state.secretKey = new Uint8Array(payload.d.secret_key);
    console.log(`Mode is`, this.state.encryptionMode);
    console.log(`Secret key is`, this.state.secretKey);
    this.state.connectedResolve?.();
  }

  private chooseEncryptionMode(options: string[]) {
    this.state.encryptionMode = options.find((option) =>
      SUPPORTED_ENCRYPTION_MODES.includes(option)
    );
  }

  private setupHeartbeat(payload: VoiceHelloPayload) {
    this.heartbeatIntervalId = setInterval(() => {
      this.heartbeat();
    }, payload.d.heartbeat_interval);
    this.heartbeat();
  }

  private heartbeat() {
    const nonce = crypto.getRandomValues(new Uint32Array(1))[0];
    this.send({
      op: VoiceOpcodes.Heartbeat,
      d: nonce,
    });
  }
}
