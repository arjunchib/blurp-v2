import { APIInteraction } from "discord-api-types/v10";
import {
  CommandModule,
  WebhookInteraction,
  CommandResolver,
  environment,
  Rest,
  Webhook,
} from "@blurp/common/core";

export const serveWebhook = (commands: CommandModule[]) => {
  const webhook = new Webhook();
  const rest = new Rest();
  const resolver = new CommandResolver(commands);

  return async (
    request: Request,
    cfEnvironment: Record<string, string>,
    context: unknown
  ) => {
    environment.applicationId = cfEnvironment.APPLICATION_ID;
    environment.guildId = cfEnvironment.GUILD_ID;
    environment.publicKey = cfEnvironment.PUBLIC_KEY;
    environment.token = cfEnvironment.TOKEN;
    const handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, rest);
      const command = resolver.resolve(apiInteraction);
      command?.(interaction, cfEnvironment, context);
      return await interaction.response;
    };
    return await webhook.handle(request, handler);
  };
};
