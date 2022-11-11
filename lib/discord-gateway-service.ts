import {
  GatewayDispatchPayload,
  GatewayHeartbeat,
  GatewayIdentify,
  GatewayReceivePayload,
  GatewaySendPayload,
} from "discord-api-types/v10";
import { GatewayDispatchEvents } from "discord-api-types/gateway/v10";
import { DiscordRestService } from "./discord-rest-service";

export class DiscordGatewayService {
  ws: WebSocket;
  s: number | null;
  heartbeatTimeoutId: number;
  heartbeatIntervalId: number;

  constructor(
    private version: number,
    private restService: DiscordRestService
  ) {}

  public async connect() {
    const { url } = await this.restService.getGatewayBot();
    const params = new URLSearchParams({
      v: this.version.toString(),
      encoding: "json",
    });
    const wsUrl = new URL(`${url}?${params}`);
    this.ws = new WebSocket(wsUrl);
    this.ws.addEventListener("open", (event) => {
      console.log("Opened!");
    });
    this.ws.addEventListener("message", (event) => {
      this.handleMessage(JSON.parse(event.data));
    });
    this.ws.addEventListener("close", (event) => {
      console.log("It closed", event);
    });
    this.ws.addEventListener("error", (event) => {
      console.log("Error", event);
    });
    setTimeout(() => this.disconnect(), 50000);
  }

  public disconnect() {
    clearTimeout(this.heartbeatTimeoutId);
    clearInterval(this.heartbeatIntervalId);
    this.ws.close();
  }

  private handleMessage(payload: GatewayReceivePayload) {
    this.s = payload.s;
    console.log("Received", payload);
    switch (payload.op) {
      case 10: // hello
        this.setupHeartbeat(payload.d.heartbeat_interval);
        break;
      case 0: // dispatch
        this.handleDispatch(payload);
        break;
    }
  }

  private send(payload: GatewaySendPayload) {
    console.log("Sent", payload);
    this.ws.send(JSON.stringify(payload));
  }

  private setupHeartbeat(heartbeatInterval: number) {
    const jitter = Math.random();
    this.heartbeatTimeoutId = setTimeout(() => {
      this.heartbeat();
      this.identify();
      this.heartbeatIntervalId = setInterval(
        () => this.heartbeat(),
        heartbeatInterval
      );
    }, heartbeatInterval * jitter);
  }

  private heartbeat() {
    const payload: GatewayHeartbeat = {
      op: 1,
      d: this.s,
    };
    this.send(payload);
  }

  private identify() {
    const payload: GatewayIdentify = {
      op: 2,
      d: {
        token: process.env.TOKEN,
        intents: 1 << 7,
        properties: {
          os: "macos",
          browser: "memebot3",
          device: "memebot3",
        },
      },
    };
    this.send(payload);
  }

  private handleDispatch(payload: GatewayDispatchPayload) {
    switch (payload.t) {
      case GatewayDispatchEvents.Ready:
        console.log("READY RECIEVED");
        break;
    }
  }
}
