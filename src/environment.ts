import { configSync } from "./deps.ts";

const { TOKEN, APPLICATION_ID, GUILD_ID, PUBLIC_KEY } = configSync();

const API_VERSION = 10;

export const environment = {
  version: API_VERSION,
  token: Deno.env.get("TOKEN") || TOKEN,
  applicationId: Deno.env.get("APPLICATION_ID") || APPLICATION_ID,
  guildId: Deno.env.get("GUILD_ID") || GUILD_ID,
  publicKey: Deno.env.get("PUBLIC_KEY") || PUBLIC_KEY,
};
