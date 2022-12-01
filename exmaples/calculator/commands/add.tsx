import {
  Command,
  Interaction,
  ChannelMessageWithSource,
  ActionRow,
  Button,
} from "../../../lib/mod.ts";
import { ButtonStyle } from "discord_api_types";

export const command: Command = {
  name: "add",
  description: "A command to add numbers",
};

export default function Add(interaction: Interaction) {
  const res = (
    <ChannelMessageWithSource>
      <ActionRow>
        <Button style={ButtonStyle.Primary} custom_id="my button">
          Click me!
        </Button>
        <Button style={ButtonStyle.Danger} custom_id="my dangerous button">
          Don't Click!
        </Button>
      </ActionRow>
    </ChannelMessageWithSource>
  );
  console.log(res);
  interaction.reply(res);
}
