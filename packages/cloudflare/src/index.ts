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
    context: ExecutionContext
  ) => {
    environment.applicationId = cfEnvironment.APPLICATION_ID;
    environment.guildId = cfEnvironment.GUILD_ID;
    environment.publicKey = cfEnvironment.PUBLIC_KEY;
    environment.token = cfEnvironment.TOKEN;
    const handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, rest);
      const command = resolver.resolve(apiInteraction);
      // waitUntil ensures the worker is kept alive after the interaction responds
      context.waitUntil(
        // catches any errors and rejects on the response promise or re-throws
        interaction.runCommand(command?.(interaction, cfEnvironment, context))
      );
      return await interaction.response;
    };
    return await webhook.handle(request, handler);
  };
};
