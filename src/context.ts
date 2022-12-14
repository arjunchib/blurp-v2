import { Client } from "./core/client.ts";
import {
  APIInteraction,
  GatewayInteractionCreateDispatch,
  InteractionType,
} from "./deps.ts";
import { GatewayInteraction } from "./interaction/gateway-interaction.ts";
import { WebhookInteraction } from "./interaction/webhook-interaction.ts";
import { Command, Handler, Options } from "./types.ts";
import { sha1 } from "./utils.ts";
import { logger } from "./logger.ts";
import { environment } from "./environment.ts";

export class Context {
  private client = new Client();
  private commands: [Command, Handler][] = [];

  constructor(private options: Options) {}

  async start() {
    this.checkEnvironment();
    this.getCommands();
    const updateCommandsPromise = this.updateCommands();
    if (this.options.useWebhooks) {
      await this.setupWebhook();
    } else {
      this.setupGateway();
    }
    await updateCommandsPromise;
  }

  private checkEnvironment() {
    const hasGatewayEnv =
      environment.applicationId && environment.guildId && environment.token;
    const hasWebhookEnv = environment.publicKey;
    if (!hasGatewayEnv && !hasWebhookEnv) {
      throw new Error("Environment variables not set");
    }
  }

  private getCommands() {
    this.options.commands.forEach((c) => {
      this.commands.push([c.command, c.default]);
    });
  }

  private async updateCommands() {
    const commands = this.commands.map((c) => c[0]);
    const hash = await sha1(JSON.stringify(commands));
    const storageKey = "commandHash";
    // Bail out if no localStorage (i.e. deno deploy)
    if (!localStorage) {
      this.client.rest.bulkOverwriteGuildApplicationCommands(commands);
      logger.base.info("Updated commands");
      return;
    }
    if (localStorage.getItem(storageKey) === hash) {
      logger.base.info("Skipped updating commands");
    } else {
      localStorage.setItem(storageKey, hash);
      this.client.rest.bulkOverwriteGuildApplicationCommands(commands);
      logger.base.info("Updated commands");
    }
  }

  private setupGateway() {
    this.client.gateway.connect();
    this.client.gateway.events.addEventListener(
      "DISPATCH_INTERACTION_CREATE",
      (payload: GatewayInteractionCreateDispatch) => {
        const interaction = new GatewayInteraction(payload.d, this.client);
        this.resolveCommand(payload.d)?.(interaction);
      }
    );
  }

  private async setupWebhook() {
    await this.client.webhook.serve(async (apiInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, this.client);
      this.resolveCommand(apiInteraction)?.(interaction);
      return await interaction.response;
    });
  }

  private resolveCommand(interaction: APIInteraction): Handler | undefined {
    const { type } = interaction;
    let name: string | undefined = undefined;
    if (type == InteractionType.ApplicationCommand) {
      name = interaction.data.name;
    } else if (
      type === InteractionType.MessageComponent ||
      type === InteractionType.ModalSubmit
    ) {
      name = interaction.data.custom_id.split(":")[0];
      console.log(name);
    }
    const command = this.commands.find((cmd) => cmd[0].name === name);
    return command?.[1];
  }
}
