import { Command, ChannelMessageWithSource } from "@blurp/common";
import {
  InteractionType,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";

export default new Command({
  meta: {
    name: "test",
    description: "Responds with diagnostics of command",
    options: [
      {
        name: "group1",
        description: "Subcommand Group",
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: "command1",
            description: "Subcommand",
            type: ApplicationCommandOptionType.Subcommand,
          },
          {
            name: "command2",
            description: "Subcommand",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "string1",
                description: "String",
                type: ApplicationCommandOptionType.String,
              },
              {
                name: "string2",
                description: "String",
                type: ApplicationCommandOptionType.String,
              },
            ],
          },
        ],
      },
      {
        name: "group2",
        description: "Subcommand Group",
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: "command1",
            description: "Subcommand",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "string1",
                description: "String",
                type: ApplicationCommandOptionType.String,
                required: false,
              },
            ],
          },
        ],
      },
    ],
  },
  onInteraction({ interaction, reply, options }) {
    if (
      interaction.type === InteractionType.ApplicationCommand &&
      interaction.data.type === ApplicationCommandType.ChatInput
    ) {
      const content = `group1: ${
        options.pluck("group1", "command2", "string1")?.value
      }`;
      reply(
        <ChannelMessageWithSource content={content}></ChannelMessageWithSource>
      );
    }
  },
});
