import { configSync } from "./deps.ts";

const { TOKEN, APPLICATION_ID, GUILD_ID, PUBLIC_KEY } = configSync();

const API_VERSION = 10;

export const environment = {
  version: API_VERSION,
  token: TOKEN,
  applicationId: APPLICATION_ID,
  guildId: GUILD_ID,
  publicKey: PUBLIC_KEY,
};
