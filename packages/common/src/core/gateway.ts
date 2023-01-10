import {
  GatewayReceivePayload,
  GatewaySendPayload,
} from "discord-api-types/v10";
import { Events } from "../events.js";
import { EventNames } from "./gateway_models.js";
import { GatewayWsConn } from "./gateway_ws_conn.js";
import { Rest } from "./rest.js";

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
