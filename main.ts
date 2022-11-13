import { DiscordClient } from "./lib/discord-client.ts";

const discord = new DiscordClient();
await discord.connect();
