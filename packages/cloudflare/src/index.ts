import { APIInteraction } from "discord-api-types/v10";
import {
  CommandModule,
  WebhookContext,
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
    execContext: ExecutionContext
  ) => {
    environment.applicationId = cfEnvironment.APPLICATION_ID;
    environment.guildId = cfEnvironment.GUILD_ID;
    environment.publicKey = cfEnvironment.PUBLIC_KEY;
    environment.token = cfEnvironment.TOKEN;
    const handler = async (apiInteraction: APIInteraction) => {
      const context = new CloudflareContext(apiInteraction, rest);
      context.environment = cfEnvironment;
      const command = resolver.resolve(apiInteraction);
      // waitUntil ensures the worker is kept alive after the interaction responds
      execContext.waitUntil(
        // catches any errors and rejects on the response promise or re-throws
        context.runCommand(command?.(context))
      );
      return await context.response;
    };
    return await webhook.handle(request, handler);
  };
};

export class CloudflareContext<T> extends WebhookContext {
  environment: T;
  execContext: ExecutionContext;
}
