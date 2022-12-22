import {
  APIInteractionResponse,
  APIInteractionResponseUpdateMessage,
  GatewayInteractionCreateDispatch,
} from "../deps.ts";
import type { Rest } from "../core/rest.ts";

export abstract class Interaction {
  constructor(
    public payload: GatewayInteractionCreateDispatch["d"],
    protected rest: Rest
  ) {}

  abstract reply(response: APIInteractionResponse): void;
  abstract defer(): void;

  async edit(response: APIInteractionResponseUpdateMessage) {
    await this.rest.editOriginalInteractionResponse(
      this.payload,
      response.data ?? {}
    );
  }
}
