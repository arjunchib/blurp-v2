import {
  ChannelType,
  ComponentType,
  InteractionResponseType,
  InteractionType,
} from "../../lib/deps.ts";
import { DiscoClient } from "../../lib/client.ts";
import ytdl from "https://deno.land/x/ytdl_core@v0.1.1/mod.ts";

const disco = new DiscoClient();

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
  const stream = await ytdl("FZUcpVmEHuk", {
    filter: (format) =>
      format.audioCodec === "opus" && format.container === "webm",
  });
  await voiceConn.playAudioStream(stream);
  voiceConn.disconnect();
}

await disco.run();
