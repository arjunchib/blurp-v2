// Auto-load dotenv vars
import "https://deno.land/std@0.167.0/dotenv/load.ts";
import {
  APIInteraction,
  GatewayInteractionCreateDispatch,
} from "npm:discord-api-types";
import {
  Webhook,
  CommandResolver,
  CommandModule,
  Options,
  WebhookInteraction,
  Rest,
  Gateway,
  GatewayInteraction,
  environment,
  // logger,
} from "npm:@blurp/common/core";

export * from "npm:@blurp/common";

environment.token = Deno.env.get("TOKEN");
environment.applicationId = Deno.env.get("APPLICATION_ID");
environment.guildId = Deno.env.get("GUILD_ID");
environment.publicKey = Deno.env.get("PUBLIC_KEY");

export const serveWebhook = (commands: CommandModule[]) => {
  const webhook = new Webhook();
  const rest = new Rest();
  const resolver = new CommandResolver(commands);

  return async (request: Request) => {
    const handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, rest);
      const command = resolver.resolve(apiInteraction);
      command?.(interaction);
      return await interaction.response;
    };
    return await webhook.handle(request, handler);
  };
};

export function startGateway(options: Options) {
  if (
    !environment.applicationId ||
    !environment.guildId ||
    !environment.token
  ) {
    throw new Error("Environment variables not set");
  }
  const rest = new Rest();
  const gateway = new Gateway(rest);
  const resolver = new CommandResolver(options.commands);
  gateway.connect();
  gateway.events.addEventListener(
    "DISPATCH_INTERACTION_CREATE",
    (payload: GatewayInteractionCreateDispatch) => {
      const interaction = new GatewayInteraction(payload.d, rest);
      const command = resolver.resolve(payload.d);
      command?.(interaction);
    }
  );
}
