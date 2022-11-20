import {
  GatewayDispatchEvents,
  GatewayInteractionCreateDispatch,
  RESTPostAPIInteractionCallbackJSONBody,
  RESTPutAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import { Gateway } from "./gateway.ts";
import { Rest } from "./rest.ts";
// import { Voice } from "./voice.ts";
import { OptionalPromise, sha1 } from "./utils.ts";

export class DiscoClient {
  rest: Rest;
  gateway: Gateway;
  // voice: Voice;

  constructor() {
    this.rest = new Rest();
    this.gateway = new Gateway(this);
    // this.voice = new Voice(this);
  }

  async run() {
    await this.updateCommands([
      {
        name: "test",
        description: "This is a test",
      },
    ]);
    await this.gateway.connect();
  }

  onInteraction(
    fn: (
      payload: GatewayInteractionCreateDispatch
    ) => OptionalPromise<RESTPostAPIInteractionCallbackJSONBody>
  ) {
    const fnWrapper = async (event: Event) => {
      const payload: GatewayInteractionCreateDispatch = (event as CustomEvent)
        .detail;
      const res = await fn(payload);
      await this.rest.createInteractionResponse(payload.d, res);
    };
    this.gateway.events.addEventListener(
      GatewayDispatchEvents.InteractionCreate,
      fnWrapper
    );
  }

  // connectVoiceChannel(guildId: string, channelId: string) {
  //   this.voice.connect(guildId, channelId);
  // }

  private async updateCommands(
    commands: RESTPutAPIApplicationCommandsJSONBody
  ) {
    const hash = await sha1(JSON.stringify(commands));
    const storageKey = "commandHash";
    if (localStorage.getItem(storageKey) === hash) {
      this.rest.bulkOverwriteGuildApplicationCommands(commands);
      console.log("Updated commands");
    } else {
      localStorage.setItem(storageKey, hash);
      console.log("Skipped updating commands");
    }
  }
}
