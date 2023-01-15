import { Interaction } from "./interaction.js";
import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";
import type { Rest } from "../core/rest.js";

export class WebhookInteraction extends Interaction {
  response: Promise<APIInteractionResponse>;
  resolve: (
    value: APIInteractionResponse | PromiseLike<APIInteractionResponse>
  ) => void;
  reject: (reason: any) => void;
  resolved = false;

  constructor(payload: APIInteraction, rest: Rest) {
    super(payload, rest);
    this.response = new Promise((resolve, reject) => {
      this.resolve = (
        value: APIInteractionResponse | PromiseLike<APIInteractionResponse>
      ) => {
        this.resolved = true;
        return resolve(value);
      };
      this.reject = reject;
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

  runCommand(result: Promise<void> | void): Promise<void> | void {
    if (result) {
      return result.catch((e) => {
        if (this.resolved) {
          throw e;
        } else {
          this.reject(e);
        }
      });
    }
  }
}
