import { Interaction } from "./interaction.js";
import {
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";

export class GatewayInteraction extends Interaction {
  reply(response: APIInteractionResponse) {
    this.rest.createInteractionResponse(this.payload, response);
  }

  defer() {
    const type =
      this.payload.type === InteractionType.MessageComponent
        ? InteractionResponseType.DeferredMessageUpdate
        : InteractionResponseType.DeferredChannelMessageWithSource;
    this.rest.createInteractionResponse(this.payload, { type });
  }
}
