import { Webhook } from "../core/webhook.ts";
import { CommandResolver } from "../command_resolver.ts";
import { APIInteraction } from "../deps.ts";
import { Rest } from "../core/rest.ts";
import { environment } from "../environment.ts";
import { CommandModule, WebhookInteraction } from "../common.ts";

export class Disco {
  private webhook = new Webhook();
  private rest = new Rest();
  private resolver: CommandResolver;

  constructor(commands: CommandModule[]) {
    this.resolver = new CommandResolver(commands);
  }

  fetch = async (
    request: Request,
    cfEnvironment: Record<string, string>,
    context: unknown
  ) => {
    environment.applicationId = cfEnvironment.APPLICATION_ID;
    environment.guildId = cfEnvironment.GUILD_ID;
    environment.publicKey = cfEnvironment.PUBLIC_KEY;
    environment.token = cfEnvironment.TOKEN;
    // if (!this.commandsUpdated) await this.updateCommands();
    const handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, this.rest);
      const command = this.resolver.resolve(apiInteraction);
      command?.(interaction, cfEnvironment, context);
      return await interaction.response;
    };
    return await this.webhook.handle(request, handler);
  };
}
