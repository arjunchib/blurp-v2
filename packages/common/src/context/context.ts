import {
  APIInteractionResponse,
  APIInteractionResponseUpdateMessage,
  GatewayInteractionCreateDispatch,
} from "discord-api-types/v10";
import type { Rest } from "../core/rest.js";

export abstract class Context {
  constructor(
    public interaction: GatewayInteractionCreateDispatch["d"],
    protected rest: Rest
  ) {}

  abstract reply(response: APIInteractionResponse): void;
  abstract defer(): void;

  edit = (async (response: APIInteractionResponseUpdateMessage) => {
    await this.rest.editOriginalInteractionResponse(
      this.interaction,
      response.data ?? {}
    );
  }).bind(this);
}
