import { GatewayDispatchEvents } from "./lib/deps.ts";
import { DiscordClient } from "./lib/discord-client.ts";

const discord = new DiscordClient();

discord.on(GatewayDispatchEvents.InteractionCreate, async () => {
  console.log("HELLO!");
});

await discord.run();
