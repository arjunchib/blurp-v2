import { configSync } from "./deps.ts";

const { TOKEN, APPLICATION_ID, GUILD_ID } = configSync();

const API_VERSION = 10;

export const environment = {
  version: API_VERSION,
  token: TOKEN,
  applicationId: APPLICATION_ID,
  guildId: GUILD_ID,
};
