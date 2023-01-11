import { InteractionType, TextInputStyle } from "discord_api_types";
import {
  Command,
  Interaction,
  Modal,
  TextInput,
  ActionRow,
  ChannelMessageWithSource,
} from "blurp";

export const command: Command = {
  name: "form",
  description: "Request a new operations",
};

export default function Form(interaction: Interaction) {
  if (interaction.payload.type === InteractionType.ApplicationCommand) {
    const modal = (
      <Modal custom_id="form:modal" title="Operation Request">
        <ActionRow>
          <TextInput
            custom_id="form:msg"
            label="Message"
            style={TextInputStyle.Short}
          ></TextInput>
        </ActionRow>
      </Modal>
    );
    interaction.reply(modal);
  } else if (interaction.payload.type === InteractionType.ModalSubmit) {
    const data = interaction.payload.data.components[0].components[0].value;
    interaction.reply(
      <ChannelMessageWithSource content={data}></ChannelMessageWithSource>
    );
  }
}
