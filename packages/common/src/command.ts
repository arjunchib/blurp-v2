import { APIApplicationCommandAutocompleteInteraction, APIApplicationCommandInteraction, APIInteraction, APIMessageComponentInteraction, APIModalSubmitInteraction, InteractionType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Immutable } from "./utils.js";
import { Context } from "./index.js";

export type Meta = Immutable<RESTPostAPIApplicationCommandsJSONBody>
export type Handler<M extends Meta = Meta, I extends APIInteraction = APIInteraction> = (
  Context: Context<M, I>,
) => void | Promise<void>

export interface CommandOptions<M extends Meta> {
   meta: M;
   onInteraction?: Handler<M>,
   onApplicationCommand?: Handler<M, APIApplicationCommandInteraction>
   onMessageComponent?: Handler<M, APIMessageComponentInteraction>
   onModalSubmit?: Handler<M, APIModalSubmitInteraction>
   onAutocomplete?: Handler<M, APIApplicationCommandAutocompleteInteraction>
}

export class Command<const T extends Meta = Meta> {
  meta : T

  constructor(private options: CommandOptions<T>) {
    this.meta = options.meta
  }

  handler = ((
    context: Context<T>,
  ): void | Promise<void> => {
    const {interaction} = context
    this.options.onInteraction?.(context)
    if (interaction.type === InteractionType.ApplicationCommand) {
      return this.options.onApplicationCommand?.(context as Context<T, APIApplicationCommandInteraction>)
    }
    if (interaction.type === InteractionType.MessageComponent) {
      return this.options.onMessageComponent?.(context as Context<T, APIMessageComponentInteraction>)
    }
    if (interaction.type === InteractionType.ModalSubmit) {
      return this.options.onModalSubmit?.(context as Context<T, APIModalSubmitInteraction>)
    }
    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      return this.options.onAutocomplete?.(context as Context<T, APIApplicationCommandAutocompleteInteraction>)
    }
  }).bind(this);
}
