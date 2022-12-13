import { Client } from "../core/client.ts";
import {
  APIInteractionResponse,
  APIInteractionResponseUpdateMessage,
  GatewayInteractionCreateDispatch,
} from "../deps.ts";

export abstract class Interaction {
  constructor(
    public payload: GatewayInteractionCreateDispatch["d"],
    protected client: Client
  ) {}

  abstract reply(response: APIInteractionResponse): void;
  abstract defer(): void;

  async edit(response: APIInteractionResponseUpdateMessage) {
    await this.client.rest.editOriginalInteractionResponse(
      this.payload,
      response.data ?? {}
    );
  }
}
