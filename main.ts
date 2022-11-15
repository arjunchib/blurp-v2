import { InteractionResponseType } from "./lib/deps.ts";
import { DiscordClient } from "./lib/discord-client.ts";

const discord = new DiscordClient();

discord.onInteraction(() => {
  discord.connectVoiceChannel("213484561127047168", "213484561127047169");
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: "Congrats on sending your command!",
    },
  };
});

await discord.run();
