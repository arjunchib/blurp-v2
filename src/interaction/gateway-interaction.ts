import { Interaction } from "./interaction.ts";
import {
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from "../deps.ts";

export class GatewayInteraction extends Interaction {
  reply(response: APIInteractionResponse) {
    this.client.rest.createInteractionResponse(this.payload, response);
  }

  defer() {
    const type =
      this.payload.type === InteractionType.MessageComponent
        ? InteractionResponseType.DeferredMessageUpdate
        : InteractionResponseType.DeferredChannelMessageWithSource;
    this.client.rest.createInteractionResponse(this.payload, { type });
  }
}
