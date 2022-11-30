import {
  ChannelType,
  ComponentType,
  InteractionResponseType,
  InteractionType,
} from "../../lib/deps.ts";
import { DiscoClient } from "../../lib/client.ts";
import { OnInteraction } from "../../lib/mixins/on_interaction.ts";
import { UpdateCommands } from "../../lib/mixins/update_commands.ts";

const disco = new (OnInteraction(DiscoClient))();

let channelId = localStorage.getItem("channelId");

disco.onInteraction((payload) => {
  if (
    payload.d.type === InteractionType.MessageComponent &&
    payload.d.data.custom_id === "channel" &&
    payload.d.data.component_type === ComponentType.ChannelSelect
  ) {
    channelId = payload.d.data.values[0];
    localStorage.setItem("channelId", channelId);
  }
  if (!channelId) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Pick a channel to play on",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.ChannelSelect,
                custom_id: "channel",
                channel_types: [ChannelType.GuildVoice],
              },
            ],
          },
        ],
      },
    };
  }
  const guildId = payload.d.guild_id;
  if (!guildId) {
    throw new Error("No guild id");
  }
  play(guildId);
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Congrats on sending your command, ${
        payload.d.member?.nick || "friendo"
      }!`,
    },
  };
});

async function play(guildId: string) {
  if (!channelId) {
    throw new Error("No channel id");
  }
  const voiceConn = await disco.voice.connect(guildId, channelId);
  const file = await Deno.open("test.webm");
  const stream = file.readable;
  // Play audio stream consumes the file
  await voiceConn.playAudioStream(stream);
  voiceConn.disconnect();
}

await disco.gateway.connect();
