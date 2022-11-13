import { DiscordGatewayService } from "./discord-gateway.service.ts";
import { DiscordRestService } from "./discord-rest.service.ts";
import { environment } from "./environment.ts";

export class DiscordClient {
  constructor() {
    const restService = new DiscordRestService(environment);

    // console.log(
    //   await restService.bulkOverwriteGuildApplicationCommands([
    //     {
    //       name: "test",
    //       description: "This is a test",
    //     },
    //   ])
    // );

    const gatewayService = new DiscordGatewayService(environment, restService);

    gatewayService.connect();
  }
}
