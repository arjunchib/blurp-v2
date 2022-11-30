import { InteractionResponseType } from "../../../lib/deps.ts";
import { Command, Interaction } from "../../../lib/mod.ts";

export const command: Command = {
  name: "add",
  description: "A command to add numbers",
};

export default function Add(interaction: Interaction) {
  interaction.reply({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: "Error!",
    },
  });
}
