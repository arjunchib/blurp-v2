import { InteractionType, TextInputStyle } from "discord_api_types";
import { Command, Interaction, Modal, TextInput } from "disco";
import { ActionRow } from "../../../src/components/action_row.ts";
import { ChannelMessageWithSource } from "../../../src/components/channel_message_with_source.ts";

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
    console.log(modal);
    interaction.reply(modal);
  } else if (interaction.payload.type === InteractionType.ModalSubmit) {
    console.log("hi");
    const data = interaction.payload.data.components[0].components[0].value;
    console.log(
      <ChannelMessageWithSource content={data}></ChannelMessageWithSource>
    );
    interaction.reply(
      <ChannelMessageWithSource content={data}></ChannelMessageWithSource>
    );
  }
}
