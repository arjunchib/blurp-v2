import { DiscoClient } from "./client.ts";
import { GatewayReceivePayload, GatewaySendPayload } from "../deps.ts";
import { Events } from "../events.ts";
import { EventNames } from "./gateway_models.ts";
import { GatewayWsConn } from "./gateway_ws_conn.ts";

export class Gateway {
  private gatewayUrl?: string;
  private ws?: GatewayWsConn;
  events = new Events<EventNames, GatewayReceivePayload>();

  constructor(private client: DiscoClient) {}

  async connect() {
    if (!this.gatewayUrl) {
      const { url } = await this.client.rest.getGatewayBot();
      this.gatewayUrl = url;
    }
    if (!this.gatewayUrl) {
      throw new Error("Could not get gateway URL");
    }
    this.ws?.disconnect();
    this.ws = new GatewayWsConn(this.gatewayUrl, this.client);
  }

  disconnect() {
    this.ws?.disconnect();
  }

  send(payload: GatewaySendPayload) {
    this.ws?.send(payload);
  }
}
