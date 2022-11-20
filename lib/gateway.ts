import {
  GatewayDispatchPayload,
  GatewayHeartbeat,
  GatewayIdentify,
  GatewayReceivePayload,
  GatewaySendPayload,
  GatewayDispatchEvents,
  GatewayOpcodes,
} from "./deps.ts";
import { DiscordRestService } from "./rest.ts";
import { environment } from "./environment.ts";
import { OptionalPromise } from "./utils.ts";

export class DiscordGatewayService {
  private ws?: WebSocket;
  private s: number | null = null;
  private heartbeatTimeoutId?: number;
  private heartbeatIntervalId?: number;
  private sessionId?: string;
  private resumeGatewayUrl?: URL;
  private gatewayUrl?: URL;
  private hooks = new Map<
    GatewayDispatchEvents,
    ((payload: GatewayDispatchPayload) => Promise<void>)[]
  >();

  constructor(private restService: DiscordRestService) {}

  async connect() {
    if (!this.gatewayUrl) {
      const { url } = await this.restService.getGatewayBot();
      this.gatewayUrl = this.createGatewayUrl(url);
    }
    this.setupWebSocket(this.gatewayUrl);
  }

  disconnect() {
    clearTimeout(this.heartbeatTimeoutId);
    clearInterval(this.heartbeatIntervalId);
    this.ws?.close();
  }

  on<T extends GatewayDispatchPayload>(
    event: T["t"],
    fn: (payload: T) => OptionalPromise<void>
  ) {
    const hooks = this.hooks.get(event);
    if (hooks) {
      hooks.push(fn as (payload: GatewayDispatchPayload) => Promise<void>);
    } else {
      this.hooks.set(event, [
        fn as (payload: GatewayDispatchPayload) => Promise<void>,
      ]);
    }
  }

  send(payload: GatewaySendPayload) {
    console.log("Sent", GatewayOpcodes[payload.op]);
    this.ws?.send(JSON.stringify(payload));
  }

  private reconnect() {
    this.disconnect();
    if (!this.resumeGatewayUrl) {
      return this.connect();
    }
    this.setupWebSocket(this.resumeGatewayUrl, {
      onOpen: () => {
        this.resume();
      },
    });
  }

  private setupWebSocket(url: URL, options?: { onOpen?: () => void }) {
    this.ws = new WebSocket(url);
    this.ws.addEventListener("open", () => {
      console.log("Gateway opened");
      options?.onOpen?.();
    });
    this.ws.addEventListener("message", async (event) => {
      await this.handleMessage(JSON.parse(event.data));
    });
    this.ws.addEventListener("close", (event) => {
      this.handleDisconnect(event);
    });
    this.ws.addEventListener("error", (event) => {
      console.log("Error", event);
    });
  }

  private createGatewayUrl(url: string) {
    const params = new URLSearchParams({
      v: environment.version.toString(),
      encoding: "json",
    });
    return new URL(`${url}?${params}`);
  }

  private async handleMessage(payload: GatewayReceivePayload) {
    this.s = payload.s;
    const log = ["Received", GatewayOpcodes[payload.op]];
    if (payload.op === GatewayOpcodes.Dispatch) log.push(`(${payload.t})`);
    console.log(...log);
    switch (payload.op) {
      case GatewayOpcodes.Hello:
        this.setupHeartbeat(payload.d.heartbeat_interval);
        break;
      case GatewayOpcodes.Dispatch:
        await this.handleDispatch(payload);
        break;
      case GatewayOpcodes.Reconnect:
        this.reconnect();
        break;
      case GatewayOpcodes.InvalidSession:
        if (payload.d) {
          this.reconnect();
        } else {
          this.disconnect();
          this.connect();
        }
        break;
    }
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
      op: GatewayOpcodes.Heartbeat,
      d: this.s,
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

  private async handleDispatch(payload: GatewayDispatchPayload) {
    switch (payload.t) {
      case GatewayDispatchEvents.Ready:
        this.sessionId = payload.d.session_id;
        this.resumeGatewayUrl = this.createGatewayUrl(
          payload.d.resume_gateway_url
        );
        break;
    }
    const hooks = this.hooks.get(payload.t);
    if (hooks) {
      await Promise.allSettled(hooks.map((fn) => fn(payload)));
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
        this.disconnect();
        this.connect();
        break;
    }
  }

  private resume() {
    this.send({
      op: GatewayOpcodes.Resume,
      d: {
        session_id: this.sessionId!,
        seq: this.s!,
        token: environment.token,
      },
    });
  }
}
