import {
  GatewayDispatchEvents,
  GatewayOpcodes,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
  VoiceOpcodes,
} from "./deps.ts";
import { DiscordGatewayService } from "./discord-gateway.service.ts";
import { environment } from "./environment.ts";

interface VoicePayload {
  op: VoiceOpcodes;
}

interface VoiceReadyPayload extends VoicePayload {
  op: VoiceOpcodes.Ready;
  d: {
    ssrc: number;
    ip: string;
    port: number;
    modes: string[];
    heartbeat_interval: number;
  };
}

interface VoiceHelloPayload extends VoicePayload {
  op: VoiceOpcodes.Hello;
  d: {
    heartbeat_interval: number;
  };
}

export class DiscordVoiceService {
  private sessionId?: string;
  private ws?: WebSocket;
  private heartbeatIntervalId?: number;

  constructor(private gatewayService: DiscordGatewayService) {}

  connect(guildId: string, channelId: string) {
    this.gatewayService.on(
      GatewayDispatchEvents.VoiceStateUpdate,
      (payload: GatewayVoiceStateUpdateDispatch) => {
        this.sessionId = payload.d.session_id;
      }
    );
    this.gatewayService.on(
      GatewayDispatchEvents.VoiceServerUpdate,
      (payload: GatewayVoiceServerUpdateDispatch) => {
        this.setupWebsocket(payload.d);
      }
    );
    this.gatewayService.send({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: {
        self_deaf: false,
        self_mute: false,
        guild_id: guildId,
        channel_id: channelId,
      },
    });
  }

  private send(payload: any) {
    console.log("[voice] Sent", VoiceOpcodes[payload.op]);
    this.ws?.send?.(JSON.stringify(payload));
  }

  private setupWebsocket(data: GatewayVoiceServerUpdateDispatch["d"]) {
    if (!this.sessionId) throw new Error("Session ID is not set");
    this.ws = new WebSocket(`wss://${data.endpoint}`);
    this.ws.addEventListener("open", () => {
      this.identify(data.guild_id, data.token);
    });
    this.ws.addEventListener("message", (event) => {
      this.handleMessage(JSON.parse(event.data));
    });
    this.ws.addEventListener("close", (event) => {
      console.log("Closed voice connection", event);
    });
  }

  private identify(guildId: string, token: string) {
    this.send({
      op: VoiceOpcodes.Identify,
      d: {
        server_id: guildId,
        user_id: environment.applicationId,
        session_id: this.sessionId,
        token,
      },
    });
  }

  private handleMessage(payload: VoicePayload) {
    console.log("[voice] Received", VoiceOpcodes[payload.op]);
    switch (payload.op) {
      case VoiceOpcodes.Hello:
        this.setupHeartbeat(payload as VoiceHelloPayload);
        break;
      case VoiceOpcodes.Ready:
        this.setupUdpConn(payload as VoiceReadyPayload);
        break;
    }
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

  private async setupUdpConn(payload: VoiceReadyPayload) {
    const destAddr: Deno.NetAddr = {
      transport: "udp",
      port: payload.d.port,
      hostname: payload.d.ip,
    };

    const socket = await Deno.listenDatagram({
      port: 0,
      transport: "udp",
      hostname: "0.0.0.0",
    });

    const packet = new DataView(new ArrayBuffer(74));
    packet.setUint16(0, 1);
    packet.setUint16(2, 70);
    packet.setUint32(4, payload.d.ssrc);
    packet.setUint16(72, payload.d.port);

    await socket.send(new Uint8Array(packet.buffer), destAddr);

    for await (const [data, addr] of socket) {
      const dec = new TextDecoder();
      console.log(dec.decode(data.subarray(8, 72)), addr);
    }
  }
}
