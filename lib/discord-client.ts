import {
  GatewayDispatchEvents,
  GatewayDispatchPayload,
  RESTPutAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import { DiscordGatewayService } from "./discord-gateway.service.ts";
import { DiscordRestService } from "./discord-rest.service.ts";
import { sha1 } from "./utils.ts";

export class DiscordClient {
  restService;
  gatewayService;

  constructor() {
    this.restService = new DiscordRestService();
    this.gatewayService = new DiscordGatewayService(this.restService);
  }

  public async run() {
    await this.updateCommands([
      {
        name: "test",
        description: "This is a test",
      },
    ]);
    await this.gatewayService.connect();
  }

  public on(
    event: GatewayDispatchEvents,
    fn: (payload: GatewayDispatchPayload) => Promise<void>
  ) {
    this.gatewayService.on(event, fn);
  }

  private async updateCommands(
    commands: RESTPutAPIApplicationCommandsJSONBody
  ) {
    const hash = await sha1(JSON.stringify(commands));
    const storageKey = "commandHash";
    if (localStorage.getItem(storageKey) === hash) {
      this.restService.bulkOverwriteGuildApplicationCommands(commands);
      console.log("Updated commands");
    } else {
      localStorage.setItem(storageKey, hash);
      console.log("Skipped updating commands");
    }
  }
}
