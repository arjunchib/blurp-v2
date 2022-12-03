import { Client } from "./client.ts";
import {
  GatewayDispatchEvents,
  GatewayDispatchPayload,
  GatewayHeartbeat,
  GatewayIdentify,
  GatewayOpcodes,
  GatewayReceivePayload,
  GatewaySendPayload,
} from "../deps.ts";
import { environment } from "../environment.ts";
import { EventNames } from "./gateway_models.ts";

export class GatewayWsConn {
  private ws!: WebSocket;
  private seq: number | null = null;
  private heartbeatTimeoutId?: number;
  private heartbeatIntervalId?: number;
  private sessionId?: string;
  private resumeGatewayUrl?: string;
  private resumed = false;

  constructor(private gatewayUrl: string, private client: Client) {
    this.sessionId = localStorage.getItem("sessionId") || undefined;
    this.resumeGatewayUrl =
      localStorage.getItem("resumeGatewayUrl") || undefined;
    const seq = localStorage.getItem("seq");
    if (seq) {
      this.seq = parseInt(seq);
    }
    console.log(this.sessionId, this.resumeGatewayUrl, this.seq);
    const tryResuming = !!this.sessionId && !!this.resumeGatewayUrl;
    this.connect(tryResuming);
  }

  send(payload: GatewaySendPayload) {
    console.log("Sent", GatewayOpcodes[payload.op]);
    this.ws.send(JSON.stringify(payload));
  }

  disconnect() {
    clearTimeout(this.heartbeatTimeoutId);
    clearInterval(this.heartbeatIntervalId);
    this.heartbeatTimeoutId = undefined;
    this.heartbeatIntervalId = undefined;
    this.ws.close();
    this.resumed = false;
  }

  private connect(resume = false) {
    const url = resume ? this.resumeGatewayUrl : this.gatewayUrl;
    const params = new URLSearchParams({
      v: environment.version.toString(),
      encoding: "json",
    });
    this.ws = new WebSocket(new URL(`${url}?${params}`));
    this.ws.addEventListener("open", () => {
      console.log("Gateway opened");
      if (resume) {
        this.resume();
      }
    });
    this.ws.addEventListener("message", async (event) => {
      await this.handleMessage(JSON.parse(event.data));
    });
    this.ws.addEventListener("close", (event) => {
      this.handleDisconnect(event);
      console.log("Gateway closed", event.reason);
    });
    this.ws.addEventListener("error", (event) => {
      console.log("Error", event);
    });
  }

  private handleMessage(payload: GatewayReceivePayload) {
    this.seq = payload.s;
    localStorage.setItem("seq", this.seq?.toString() || "");
    const log = ["Received", GatewayOpcodes[payload.op]];
    if (payload.op === GatewayOpcodes.Dispatch) log.push(`(${payload.t})`);
    console.log(...log);
    switch (payload.op) {
      case GatewayOpcodes.Hello:
        console.log("Resumed", this.resumed);
        if (this.resumed) {
          this.resumeHeartbeat(payload.d.heartbeat_interval);
        } else {
          this.setupHeartbeat(payload.d.heartbeat_interval);
        }
        break;
      case GatewayOpcodes.Dispatch:
        this.handleDispatch(payload);
        break;
      case GatewayOpcodes.Reconnect:
        this.reconnect();
        break;
      case GatewayOpcodes.InvalidSession:
        if (payload.d) {
          this.reconnect();
        } else {
          this.hardReconnect();
        }
        break;
    }
    this.dispatchEvent(payload);
  }

  private dispatchEvent(payload: GatewayReceivePayload) {
    let eventName = GatewayOpcodes[payload.op].toUpperCase();
    if (payload.t) {
      eventName += `_${payload.t}`;
      this.client.gateway.events.dispatchEvent("DISPATCH", payload);
    }
    this.client.gateway.events.dispatchEvent(eventName as EventNames, payload);
  }

  private setupHeartbeat(heartbeatInterval: number) {
    if (this.heartbeatIntervalId || this.heartbeatTimeoutId) return;
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

  private resumeHeartbeat(heartbeatInterval: number) {
    if (this.heartbeatIntervalId || this.heartbeatTimeoutId) return;
    this.heartbeat();
    this.heartbeatIntervalId = setInterval(
      () => this.heartbeat(),
      heartbeatInterval
    );
  }

  private heartbeat() {
    const payload: GatewayHeartbeat = {
      op: GatewayOpcodes.Heartbeat,
      d: this.seq,
    };
    this.send(payload);
  }

  private identify() {
    const payload: GatewayIdentify = {
      op: GatewayOpcodes.Identify,
      d: {
        token: environment.token,
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
        this.sessionId = payload.d.session_id;
        this.resumeGatewayUrl = payload.d.resume_gateway_url;
        localStorage.setItem("sessionId", this.sessionId);
        localStorage.setItem("resumeGatewayUrl", this.resumeGatewayUrl);
        break;
    }
  }

  private handleDisconnect(event: CloseEvent) {
    switch (event.code) {
      case 4000:
      case 4001:
      case 4002:
      case 4003:
      case 4004:
      case 4005:
      case 4007:
      case 4008:
      case 4009:
        this.reconnect();
        break;
      case 4010:
      case 4011:
      case 4012:
      case 4013:
      case 4014:
        this.hardReconnect();
        break;
    }
  }

  private resume() {
    this.resumed = true;
    this.send({
      op: GatewayOpcodes.Resume,
      d: {
        session_id: this.sessionId!,
        seq: this.seq!,
        token: environment.token,
      },
    });
  }

  private reconnect() {
    this.disconnect();
    this.connect(true);
  }

  private hardReconnect() {
    this.disconnect();
    this.connect();
  }
}
