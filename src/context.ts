import { Client } from "./core/client.ts";
import { GatewayInteractionCreateDispatch, InteractionType } from "./deps.ts";
import { Interaction } from "./interaction.ts";
import { Options } from "./types.ts";
import { sha1 } from "./utils.ts";

export class Context {
  private client = new Client();

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
        } else if (
          type === InteractionType.MessageComponent ||
          type === InteractionType.ModalSubmit
        ) {
          name = payload.d.data.custom_id.split(":")[0];
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
