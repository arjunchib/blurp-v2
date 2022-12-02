import { DiscoClient } from "./client.ts";
import {
  APIInteractionResponse,
  APIInteractionResponseUpdateMessage,
  GatewayInteractionCreateDispatch,
  InteractionResponseType,
  InteractionType,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import { sha1 } from "./utils.ts";

export type Command = RESTPostAPIApplicationCommandsJSONBody;

export class Interaction {
  constructor(
    public payload: GatewayInteractionCreateDispatch["d"],
    private client: DiscoClient
  ) {}

  reply(response: APIInteractionResponse) {
    this.client.rest.createInteractionResponse(this.payload, response);
  }

  defer() {
    const type =
      this.payload.type === InteractionType.MessageComponent
        ? InteractionResponseType.DeferredMessageUpdate
        : InteractionResponseType.DeferredChannelMessageWithSource;
    this.client.rest.createInteractionResponse(this.payload, { type });
  }

  async edit(response: APIInteractionResponseUpdateMessage) {
    await this.client.rest.editOriginalInteractionResponse(
      this.payload,
      response.data ?? {}
    );
  }
}

interface Options {
  commands: [Command, (Interaction: Interaction) => void][];
}

class DiscoServer {
  private client = new DiscoClient();

  constructor(private options: Options) {
    this.updateCommands();
    this.setupInteractions();
    this.client.gateway.connect();
  }

  private async updateCommands() {
    const commands = this.options.commands.map((c) => c[0]);
    console.log(commands);
    const hash = await sha1(JSON.stringify(commands));
    const storageKey = "commandHash";
    console.log(localStorage.getItem(storageKey), hash);
    if (localStorage.getItem(storageKey) === hash) {
      console.log("Skipped updating commands");
    } else {
      localStorage.setItem(storageKey, hash);
      this.client.rest.bulkOverwriteGuildApplicationCommands(commands);
      console.log("Updated commands");
    }
  }

  private setupInteractions() {
    this.client.gateway.events.addEventListener(
      "DISPATCH_INTERACTION_CREATE",
      (payload: GatewayInteractionCreateDispatch) => {
        const { type } = payload.d;
        let name: string | undefined = undefined;
        if (type == InteractionType.ApplicationCommand) {
          name = payload.d.data.name;
        } else if (type === InteractionType.MessageComponent) {
          name = payload.d.message.interaction?.name;
        }
        const command = this.options.commands.find(
          (cmd) => cmd[0].name === name
        );
        const interaction = new Interaction(payload.d, this.client);
        command?.[1](interaction);
      }
    );
  }
}

export function start(options: Options) {
  const server = new DiscoServer(options);
}
