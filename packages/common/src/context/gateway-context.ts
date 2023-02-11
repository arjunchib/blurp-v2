import { Context } from "./context.js";
import {
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";

export class GatewayContext extends Context {
  reply(response: APIInteractionResponse) {
    this.rest.createInteractionResponse(this.interaction, response);
  }

  defer() {
    const type =
      this.interaction.type === InteractionType.MessageComponent
        ? InteractionResponseType.DeferredMessageUpdate
        : InteractionResponseType.DeferredChannelMessageWithSource;
    this.rest.createInteractionResponse(this.interaction, { type });
  }
}
