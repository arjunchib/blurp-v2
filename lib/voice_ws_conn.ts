import { VoiceOpcodes } from "./deps.ts";
import { environment } from "./environment.ts";
import { Events } from "./events.ts";
import {
  VoiceConnState,
  VoiceHelloPayload,
  VoicePayload,
} from "./voice_models.ts";

export class VoiceWsConn {
  private ws!: WebSocket;
  private heartbeatIntervalId?: number;
  events = new Events<VoiceOpcodes, VoicePayload>();

  constructor(private state: VoiceConnState) {
    if (!state.endpoint) {
      throw new Error("No endpoint from gateway");
    }
    this.ws = new WebSocket(`wss://${this.state.endpoint}`);
    this.ws.addEventListener("open", () => {
      this.identify();
    });
    this.ws.addEventListener("message", (event) => {
      this.handleMessage(JSON.parse(event.data));
    });
    this.ws.addEventListener("close", (event) => {
      console.log("Closed voice connection", event);
    });
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

  private handleMessage(payload: VoicePayload) {
    console.log("[voice] Received", VoiceOpcodes[payload.op]);
    switch (payload.op) {
      case VoiceOpcodes.Hello:
        this.setupHeartbeat(payload);
        break;
    }
    this.events.dispatchEvent(payload.op, payload);
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
