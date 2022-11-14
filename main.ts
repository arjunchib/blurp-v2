import { InteractionResponseType } from "./lib/deps.ts";
import { DiscordClient } from "./lib/discord-client.ts";

const discord = new DiscordClient();

discord.onInteraction(() => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: "Congrats on sending your command!",
    },
  };
});

await discord.run();
