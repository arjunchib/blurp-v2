import { Webhook } from "../core/webhook.ts";
import { CommandResolver } from "../command_resolver.ts";
import { APIInteraction } from "../deps.ts";
import { Rest } from "../core/rest.ts";
import { environment } from "../environment.ts";
import { CommandModule, WebhookInteraction } from "../common.ts";

declare global {
  const Bun: {
    env: {
      [name: string]: string;
    };
  };
}

if (Bun) {
  environment.token = Bun.env.TOKEN;
  environment.applicationId = Bun.env.APPLICATION_ID;
  environment.guildId = Bun.env.GUILD_ID;
  environment.publicKey = Bun.env.PUBLIC_KEY;
}

export class Disco {
  port = 8787;
  private webhook = new Webhook();
  private rest = new Rest();
  private resolver: CommandResolver;
  private handler: Parameters<Webhook["handle"]>[1];

  constructor(commands: CommandModule[]) {
    this.resolver = new CommandResolver(commands);
    this.handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, this.rest);
      const command = this.resolver.resolve(apiInteraction);
      command?.(interaction);
      return await interaction.response;
    };
  }

  fetch = async (request: Request) => {
    return await this.webhook.handle(request, this.handler);
  };
}
