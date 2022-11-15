import {
  GatewayDispatchEvents,
  GatewayDispatchPayload,
  GatewayInteractionCreateDispatch,
  RESTPostAPIInteractionCallbackJSONBody,
  RESTPutAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import { DiscordGatewayService } from "./discord-gateway.service.ts";
import { DiscordRestService } from "./discord-rest.service.ts";
import { DiscordVoiceService } from "./discord-voice.service.ts";
import { OptionalPromise, sha1 } from "./utils.ts";

export class DiscordClient {
  private restService;
  private gatewayService;
  private voiceService;

  constructor() {
    this.restService = new DiscordRestService();
    this.gatewayService = new DiscordGatewayService(this.restService);
    this.voiceService = new DiscordVoiceService(this.gatewayService);
  }

  async run() {
    await this.updateCommands([
      {
        name: "test",
        description: "This is a test",
      },
    ]);
    await this.gatewayService.connect();
  }

  on<T extends GatewayDispatchPayload>(
    event: T["t"],
    fn: (payload: T) => OptionalPromise<void>
  ) {
    this.gatewayService.on(event, fn);
  }

  onInteraction(
    fn: (
      payload: GatewayInteractionCreateDispatch
    ) => OptionalPromise<RESTPostAPIInteractionCallbackJSONBody>
  ) {
    const fnWrapper = async (payload: GatewayInteractionCreateDispatch) => {
      const res = await fn(payload);
      await this.restService.createInteractionResponse(payload.d, res);
    };
    this.on(GatewayDispatchEvents.InteractionCreate, fnWrapper);
  }

  connectVoiceChannel(guildId: string, channelId: string) {
    this.voiceService.connect(guildId, channelId);
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
