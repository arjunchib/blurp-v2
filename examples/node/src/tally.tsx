import {
  Command,
  Context,
  ChannelMessageWithSource,
  ActionRow,
  Button,
  UpdateMessage,
} from "@blurp/common";
import { ButtonStyle, InteractionType } from "discord-api-types/v10";

export const command: Command = {
  name: "tally",
  description: "See current score",
};

let store = {
  count: 0,
};

export default async function Tally({ interaction, reply }: Context) {
  const user = interaction.member?.user || interaction.user;

  const getTally = () => {
    return store.count;
  };

  const setTally = (value: number) => {
    store.count = value;
  };

  const { type } = interaction;
  let tally = getTally();

  if (type === InteractionType.ApplicationCommand) {
    reply(
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
    if (interaction.data.custom_id === "tally:up") {
      tally += 1;
    } else if (interaction.data.custom_id === "tally:down") {
      tally -= 1;
    }
    setTally(tally);
    reply(<UpdateMessage content={`Current score: ${tally}`}></UpdateMessage>);
  }
}
