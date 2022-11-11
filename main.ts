import { DiscordGatewayService } from "./lib/discord-gateway-service.ts";
import { DiscordRestService } from "./lib/discord-rest-service.ts";
import { configSync } from "https://deno.land/std@0.163.0/dotenv/mod.ts";

const { TOKEN } = configSync();

const API_VERSION = 10;

const context = {
  version: API_VERSION,
  token: TOKEN,
};

const restService = new DiscordRestService(context);
const gatewayService = new DiscordGatewayService(context, restService);

gatewayService.connect();
