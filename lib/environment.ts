import { configSync } from "https://deno.land/std@0.163.0/dotenv/mod.ts";

const { TOKEN, APPLICATION_ID, GUILD_ID } = configSync();

const API_VERSION = 10;

export const environment = {
  version: API_VERSION,
  token: TOKEN,
  applicationId: APPLICATION_ID,
  guildId: GUILD_ID,
};
