import {
  Command,
  Interaction,
  ChannelMessageWithSource,
  ActionRow,
  Button,
  UpdateMessage,
} from "../../../lib/mod.ts";
import { ButtonStyle, InteractionType } from "discord_api_types";

export const command: Command = {
  name: "test",
  description: "A command to do some testing",
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export default async function Test(interaction: Interaction) {
  const { type } = interaction.payload;

  if (type === InteractionType.ApplicationCommand) {
    interaction.reply(
      <ChannelMessageWithSource>
        <ActionRow>
          <Button style={ButtonStyle.Primary} custom_id="myButton">
            Click me!
          </Button>
          <Button style={ButtonStyle.Danger} custom_id="myAsyncButton">
            Click me asynchronously!
          </Button>
        </ActionRow>
      </ChannelMessageWithSource>
    );
  } else if (type === InteractionType.MessageComponent) {
    if (interaction.payload.data.custom_id === "myButton") {
      interaction.reply(
        <UpdateMessage content="Button Clicked"></UpdateMessage>
      );
    } else if (interaction.payload.data.custom_id === "myAsyncButton") {
      interaction.defer();
      await sleep(2000);
      await interaction.edit(
        <UpdateMessage content="Button Clicked Asyncly"></UpdateMessage>
      );
    }
  }
}