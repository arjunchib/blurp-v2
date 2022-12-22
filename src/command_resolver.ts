import { APIInteraction, InteractionType } from "./deps.ts";
import { CommandModule, Handler } from "./runtimes/common.ts";

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
