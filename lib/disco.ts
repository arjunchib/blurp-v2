import { DiscoClient } from "./client.ts";
import {
  APIInteractionResponse,
  GatewayInteractionCreateDispatch,
  InteractionType,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import { sha1 } from "./utils.ts";

export type Command = RESTPostAPIApplicationCommandsJSONBody;

export class Interaction {
  constructor(
    public payload: GatewayInteractionCreateDispatch,
    private client: DiscoClient
  ) {}

  reply(response: APIInteractionResponse) {
    this.client.rest.createInteractionResponse(this.payload.d, response);
  }

  deferReply() {}
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
        if (payload.d.type === InteractionType.ApplicationCommand) {
          const name = payload.d.data.name;
          const command = this.options.commands.find(
            (cmd) => cmd[0].name === name
          );
          const interaction = new Interaction(payload, this.client);
          command?.[1](interaction);
        }
      }
    );
  }
}

export function start(options: Options) {
  const server = new DiscoServer(options);
}
