import { Client } from "./core/client.ts";
import {
  APIInteractionResponse,
  APIInteractionResponseUpdateMessage,
  GatewayInteractionCreateDispatch,
  InteractionResponseType,
  InteractionType,
} from "./deps.ts";

export class Interaction {
  constructor(
    public payload: GatewayInteractionCreateDispatch["d"],
    private client: Client
  ) {}

  reply(response: APIInteractionResponse) {
    console.log(JSON.stringify(response));
    this.client.rest.createInteractionResponse(this.payload, response);
  }

  defer() {
    const type =
      this.payload.type === InteractionType.MessageComponent
        ? InteractionResponseType.DeferredMessageUpdate
        : InteractionResponseType.DeferredChannelMessageWithSource;
    this.client.rest.createInteractionResponse(this.payload, { type });
  }

  async edit(response: APIInteractionResponseUpdateMessage) {
    console.log(response);
    await this.client.rest.editOriginalInteractionResponse(
      this.payload,
      response.data ?? {}
    );
  }
}
