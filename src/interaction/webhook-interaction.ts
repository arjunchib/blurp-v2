import { Interaction } from "../common.ts";
import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from "../deps.ts";
import type { Rest } from "../core/rest.ts";

export class WebhookInteraction extends Interaction {
  response: Promise<APIInteractionResponse>;
  private resolve!: (
    value: APIInteractionResponse | PromiseLike<APIInteractionResponse>
  ) => void;

  constructor(payload: APIInteraction, rest: Rest) {
    super(payload, rest);
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
