import { DiscordGatewayService } from "./lib/discord-gateway-service.ts";
import { DiscordRestService } from "./lib/discord-rest-service.ts";
import { configSync } from "https://deno.land/std@0.163.0/dotenv/mod.ts";

const { TOKEN, APPLICATION_ID, GUILD_ID } = configSync();

const API_VERSION = 10;

const options = {
  version: API_VERSION,
  token: TOKEN,
  applicationId: APPLICATION_ID,
  guildId: GUILD_ID,
};

const restService = new DiscordRestService(options);

// console.log(
//   await restService.bulkOverwriteGuildApplicationCommands([
//     {
//       name: "test",
//       description: "This is a test",
//     },
//   ])
// );

const gatewayService = new DiscordGatewayService(options, restService);

gatewayService.connect();
