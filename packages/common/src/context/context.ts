import {
  APIInteractionResponse,
  APIInteractionResponseUpdateMessage,
  GatewayInteractionCreateDispatch,
} from "discord-api-types/v10";
import type { Rest } from "../core/rest.js";

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
