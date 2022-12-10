import { Client } from "./core/client.ts";
import {
  GatewayInteractionCreateDispatch,
  InteractionType,
  RESTPostAPIApplicationCommandsJSONBody,
  join,
} from "./deps.ts";
import { Interaction } from "./interaction.ts";
import { Options } from "./types.ts";
import { sha1 } from "./utils.ts";
import { logger } from "./logger.ts";

export class Context {
  private client = new Client();
  private commands: [
    RESTPostAPIApplicationCommandsJSONBody,
    (Interaction: Interaction) => void
  ][] = [];

  constructor(private options: Options) {}

  async start() {
    await this.getCommands();
    const updateCommandsPromise = this.updateCommands();
    this.setupInteractions();
    this.client.gateway.connect();
    await updateCommandsPromise;
  }

  private async getCommands() {
    const commandDir = join(
      Deno.cwd(),
      this.options.commandDir || "./commands"
    );
    for await (const dirEntry of Deno.readDir(commandDir)) {
      if (dirEntry.isFile) {
        const { default: fn, command } = await import(
          `${commandDir}/${dirEntry.name}`
        );
        this.commands.push([command, fn]);
      }
    }
  }

  private async updateCommands() {
    const commands = this.commands.map((c) => c[0]);
    const hash = await sha1(JSON.stringify(commands));
    const storageKey = "commandHash";
    if (localStorage.getItem(storageKey) === hash) {
      logger.base.info("Skipped updating commands");
    } else {
      localStorage.setItem(storageKey, hash);
      this.client.rest.bulkOverwriteGuildApplicationCommands(commands);
      logger.base.info("Updated commands");
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
        } else if (
          type === InteractionType.MessageComponent ||
          type === InteractionType.ModalSubmit
        ) {
          name = payload.d.data.custom_id.split(":")[0];
        }
        const command = this.commands.find((cmd) => cmd[0].name === name);
        const interaction = new Interaction(payload.d, this.client);
        command?.[1](interaction);
      }
    );
  }
}
