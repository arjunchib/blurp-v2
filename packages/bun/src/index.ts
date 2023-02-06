import {
  APIInteraction,
  GatewayInteractionCreateDispatch,
} from "discord-api-types/v10";
import {
  Webhook,
  CommandResolver,
  Rest,
  environment,
  CommandModule,
  WebhookInteraction,
  Gateway,
  GatewayInteraction,
} from "@blurp/common/core";

export { updateCommands } from "@blurp/common";

environment.token = Bun.env.TOKEN;
environment.applicationId = Bun.env.APPLICATION_ID;
environment.guildId = Bun.env.GUILD_ID;
environment.publicKey = Bun.env.PUBLIC_KEY;

const rest = new Rest();

export const serveWebhook = (commands: CommandModule[]) => {
  const webhook = new Webhook();
  const rest = new Rest();
  const resolver = new CommandResolver(commands);

  return async (request: Request) => {
    const handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, rest);
      const command = resolver.resolve(apiInteraction);
      interaction.runCommand(command?.(interaction));
      return await interaction.response;
    };
    return await webhook.handle(request, handler);
  };
};

// https://github.com/oven-sh/bun/issues/1592
export function connectGateway(commands: CommandModule[]) {
  const rest = new Rest();
  const gateway = new Gateway(rest);
  const resolver = new CommandResolver(commands);
  gateway.events.addEventListener(
    "DISPATCH_INTERACTION_CREATE",
    (payload: GatewayInteractionCreateDispatch) => {
      const apiInteraction = payload.d;
      const interaction = new GatewayInteraction(apiInteraction, rest);
      const command = resolver.resolve(apiInteraction);
      command?.(interaction);
    }
  );
  gateway.connect();
}
