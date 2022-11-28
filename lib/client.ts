import { Gateway } from "./gateway.ts";
import { Rest } from "./rest.ts";
import { Voice } from "./voice.ts";

export class DiscoClient {
  rest: Rest;
  gateway: Gateway;
  voice: Voice;

  constructor() {
    this.rest = new Rest();
    this.gateway = new Gateway(this);
    this.voice = new Voice(this);
  }
}
