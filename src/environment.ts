// Auto-load dotenv vars
import "https://deno.land/std@0.167.0/dotenv/load.ts";

const API_VERSION = 10;

export const environment = {
  version: API_VERSION,
  token: Deno.env.get("TOKEN"),
  applicationId: Deno.env.get("APPLICATION_ID"),
  guildId: Deno.env.get("GUILD_ID"),
  publicKey: Deno.env.get("PUBLIC_KEY"),
};
