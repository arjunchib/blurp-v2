import {
  ChannelMessageWithSource,
  ActionRow,
  Button,
  UpdateMessage,
} from "@disco/cloudflare";
import { Command, Interaction } from "@disco/common";
import { ButtonStyle, InteractionType } from "discord-api-types/v10";

export const command: Command = {
  name: "tally",
  description: "See current score",
};

export default async function Tally(
  interaction: Interaction,
  environment: { TALLY_KV: KVNamespace }
) {
  const user = interaction.payload.member?.user || interaction.payload.user;

  const getTally = async (): Promise<number> => {
    if (user?.id == null) return 0;
    const value = await environment.TALLY_KV.get(user.id);
    return value ? parseInt(value) : 0;
  };

  const setTally = async (value: number) => {
    if (user?.id == null) return;
    await environment.TALLY_KV.put(user.id, value.toString());
  };

  const { type } = interaction.payload;
  let tally = await getTally();

  if (type === InteractionType.ApplicationCommand) {
    interaction.reply(
      <ChannelMessageWithSource content={`Current score: ${tally}`}>
        <ActionRow>
          <Button style={ButtonStyle.Primary} custom_id="tally:down">
            Down
          </Button>
          <Button style={ButtonStyle.Primary} custom_id="tally:up">
            Up
          </Button>
        </ActionRow>
      </ChannelMessageWithSource>
    );
  } else if (type === InteractionType.MessageComponent) {
    if (interaction.payload.data.custom_id === "tally:up") {
      tally += 1;
    } else if (interaction.payload.data.custom_id === "tally:down") {
      tally -= 1;
    }
    setTally(tally);
    interaction.reply(
      <UpdateMessage content={`Current score: ${tally}`}></UpdateMessage>
    );
  }
}
