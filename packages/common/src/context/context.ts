import {
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponseUpdateMessage,
  InteractionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import type { Rest } from "../core/rest.js";
import { Options } from "../options.js";
import { Meta } from "../command.js";

type IsMeta<T> = T extends Meta ? T : never;

// Branded Type:
// declare const tag: unique symbol;
// export type Interaction<T = Immutable<Command>> = APIInteraction & {
//   readonly [tag]?: T;
// };

export abstract class Context<
  M = Meta,
  I extends APIInteraction = APIInteraction
> {
  constructor(public interaction: I, protected rest: Rest) {}

  abstract reply(response: APIInteractionResponse): void;
  abstract defer(): void;

  edit = (async (response: APIInteractionResponseUpdateMessage) => {
    await this.rest.editOriginalInteractionResponse(
      this.interaction,
      response.data ?? {}
    );
  }).bind(this);

  #options: Options<NonNullable<IsMeta<M>["options"]>> | undefined = undefined;

  get options() {
    if (this.#options) return this.#options;
    // TODO: create isSlashCommand helper
    // or maybe check for options instead
    if (
      !(
        this.interaction.type === InteractionType.ApplicationCommand &&
        this.interaction.data.type === ApplicationCommandType.ChatInput &&
        this.interaction.data.options
      )
    ) {
      return null;
    }
    const options = new Options<NonNullable<IsMeta<M>["options"]>>(
      this.interaction.data.options
    );
    this.#options = options;
    return options;
  }
}
