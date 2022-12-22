import { GatewayReceivePayload, GatewaySendPayload } from "../deps.ts";
import { Events } from "../events.ts";
import { EventNames } from "./gateway_models.ts";
import { GatewayWsConn } from "./gateway_ws_conn.ts";
import { Rest } from "./rest.ts";

export class Gateway {
  private gatewayUrl?: string;
  private ws?: GatewayWsConn;
  events = new Events<EventNames, GatewayReceivePayload>();

  constructor(private rest: Rest) {}

  async connect() {
    if (!this.gatewayUrl) {
      const { url } = await this.rest.getGatewayBot();
      this.gatewayUrl = url;
    }
    if (!this.gatewayUrl) {
      throw new Error("Could not get gateway URL");
    }
    this.ws?.disconnect();
    this.ws = new GatewayWsConn(this.gatewayUrl, this);
  }

  disconnect() {
    this.ws?.disconnect();
  }

  send(payload: GatewaySendPayload) {
    this.ws?.send(payload);
  }
}
