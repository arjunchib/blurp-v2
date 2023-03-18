import {
  Command,
  ChannelMessageWithSource,
  ActionRow,
  Button,
  UpdateMessage,
} from "@blurp/common";
import { ButtonStyle } from "discord-api-types/v10";

let store = {
  count: 0,
};

const getTally = () => {
  return store.count;
};

const setTally = (value: number) => {
  store.count = value;
};

export default new Command({
  meta: {
    name: "tally",
    description: "See current score",
  },
  onApplicationCommand({ reply }) {
    reply(
      <ChannelMessageWithSource content={`Current score: ${getTally()}`}>
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
  },
  onMessageComponent({ interaction, reply }) {
    let tally = getTally();
    if (interaction.data.custom_id === "tally:up") {
      tally += 1;
    } else if (interaction.data.custom_id === "tally:down") {
      tally -= 1;
    }
    setTally(tally);
    reply(<UpdateMessage content={`Current score: ${tally}`}></UpdateMessage>);
  },
});
