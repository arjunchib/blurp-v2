import { APIInteraction, InteractionType } from "discord-api-types/v10";
import { Command, Handler } from "./command.js";

export class CommandResolver {
  constructor(private commands: Command[]) {}

  resolve(interaction: APIInteraction): Handler | undefined {
    const { type } = interaction;
    let name: string | undefined = undefined;
    if (type == InteractionType.ApplicationCommand) {
      name = interaction.data.name;
    } else if (
      type === InteractionType.MessageComponent ||
      type === InteractionType.ModalSubmit
    ) {
      name = interaction.data.custom_id.split(":")[0];
    }
    const command = this.commands.find((cmd) => cmd.meta.name === name);
    return command?.handler;
  }
}
