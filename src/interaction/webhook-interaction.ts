import { Interaction } from "./interaction.ts";
import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from "../deps.ts";
import { Client } from "../core/client.ts";

export class WebhookInteraction extends Interaction {
  response: Promise<APIInteractionResponse>;
  private resolve!: (
    value: APIInteractionResponse | PromiseLike<APIInteractionResponse>
  ) => void;

  constructor(payload: APIInteraction, client: Client) {
    super(payload, client);
    this.response = new Promise((resolve, _reject) => {
      this.resolve = resolve;
    });
  }

  reply(response: APIInteractionResponse) {
    this.resolve(response);
  }

  defer() {
    const type =
      this.payload.type === InteractionType.MessageComponent
        ? InteractionResponseType.DeferredMessageUpdate
        : InteractionResponseType.DeferredChannelMessageWithSource;
    this.resolve({ type });
  }
}
