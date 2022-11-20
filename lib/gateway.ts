import { DiscoClient } from "./client.ts";
import { GatewayDispatchEvents } from "./deps.ts";
import { Events } from "./events.ts";
import { GatewayWsConn } from "./gateway_ws_conn.ts";

export class Gateway {
  private gatewayUrl?: string;
  private ws?: GatewayWsConn;
  events = new Events<GatewayDispatchEvents>();

  constructor(private client: DiscoClient) {}

  async connect() {
    if (!this.gatewayUrl) {
      const { url } = await this.client.rest.getGatewayBot();
      this.gatewayUrl = url;
    }
    this.ws?.disconnect();
    this.ws = new GatewayWsConn(this.gatewayUrl, this.client);
  }

  disconnect() {
    this.ws?.disconnect();
  }
}
