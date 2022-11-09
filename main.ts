import { DiscordGatewayService } from "./lib/discord-gateway-service";
import { DiscordRestService } from "./lib/discord-rest-service";

const API_VERSION = 10;

const restService = new DiscordRestService(API_VERSION);
const gatewayService = new DiscordGatewayService(API_VERSION, restService);

gatewayService.connect();
