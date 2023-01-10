import { APIInteraction, InteractionType } from "discord-api-types/v10";
import { CommandModule, Handler } from "./types.js";

export class CommandResolver {
  constructor(private commands: CommandModule[]) {}

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
    const command = this.commands.find((cmd) => cmd.command.name === name);
    return command?.default;
  }
}
