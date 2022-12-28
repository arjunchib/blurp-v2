import {
  Command,
  Interaction,
  ChannelMessageWithSource,
  ActionRow,
  SelectMenu,
  SelectOption,
  UpdateMessage,
} from "disco";
import { InteractionType, ComponentType } from "discord_api_types";

export const command: Command = {
  name: "color",
  description: "Pick you're favorite color",
};

export default function ColorPicker(interaction: Interaction) {
  const { type } = interaction.payload;

  if (type === InteractionType.ApplicationCommand) {
    interaction.reply(
      <ChannelMessageWithSource>
        <ActionRow>
          <SelectMenu
            type={ComponentType.StringSelect}
            custom_id="color:picker"
          >
            <SelectOption value="#F00">Red</SelectOption>
            <SelectOption value="#0F0">Green</SelectOption>
            <SelectOption value="#00F">Blue</SelectOption>
          </SelectMenu>
        </ActionRow>
      </ChannelMessageWithSource>
    );
  } else if (type === InteractionType.MessageComponent) {
    const color =
      interaction.payload.data.component_type === ComponentType.StringSelect
        ? interaction.payload.data.values[0]
        : "N/A";
    const content = `The color you have picked is: ${color}`;
    interaction.reply(<UpdateMessage content={content}></UpdateMessage>);
  }
}
