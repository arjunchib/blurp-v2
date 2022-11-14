import {
  GatewayDispatchEvents,
  GatewayDispatchPayload,
  GatewayInteractionCreateDispatch,
  RESTPostAPIInteractionCallbackJSONBody,
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

  public onInteraction(
    fn: (
      payload: GatewayInteractionCreateDispatch
    ) =>
      | Promise<RESTPostAPIInteractionCallbackJSONBody>
      | RESTPostAPIInteractionCallbackJSONBody
  ) {
    const fnWrapper = async (payload: GatewayDispatchPayload) => {
      if (payload.t !== GatewayDispatchEvents.InteractionCreate) return;
      const res = await fn(payload);
      await this.restService.createInteractionResponse(payload.d, res);
    };
    this.on(GatewayDispatchEvents.InteractionCreate, fnWrapper);
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
