import { Gateway } from "./gateway.ts";
import { Rest } from "./rest.ts";
import { Voice } from "./voice.ts";
import { Webhook } from "./webhook.ts";

export class Client {
  rest: Rest;
  gateway: Gateway;
  voice: Voice;
  webhook: Webhook;

  constructor() {
    this.rest = new Rest();
    this.gateway = new Gateway(this);
    this.voice = new Voice(this);
    this.webhook = new Webhook();
  }
}
