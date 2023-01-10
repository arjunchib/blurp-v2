// Auto-load dotenv vars
import "https://deno.land/std@0.167.0/dotenv/load.ts";
import {
  APIInteraction,
  GatewayInteractionCreateDispatch,
  APIApplicationCommand,
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
  logger,
} from "npm:@blurp/common/core";

environment.token = Deno.env.get("TOKEN");
environment.applicationId = Deno.env.get("APPLICATION_ID");
environment.guildId = Deno.env.get("GUILD_ID");
environment.publicKey = Deno.env.get("PUBLIC_KEY");

function compareCommands(
  localCommand: CommandModule["command"],
  remoteCommand: APIApplicationCommand
) {
  // checks if a is a subset of b
  const subset = (a: any, b: any) => {
    for (const k in a) {
      if (typeof a[k] === "object" && typeof b[k] === "object") {
        if (!subset(a[k], b[k])) return false;
      } else if (a[k] !== b[k]) {
        return false;
      }
    }
    return true;
  };
  return subset(localCommand, remoteCommand);
}

export class Disco {
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
    this.rest.getGuildApplicationCommands().then((data) => {
      const commandData = commands.map((c) => c.command);
      const commandsMatch = commandData.every((localCommand) => {
        const remoteCommand = data.find((c) => c.name === localCommand.name);
        if (!remoteCommand) return false;
        return compareCommands(localCommand, remoteCommand);
      });
      if (!commandsMatch) {
        this.rest
          .bulkOverwriteGuildApplicationCommands(commandData)
          .then((_) => console.log("Updated commands"));
      }
    });
  }

  fetch = async (request: Request) => {
    if (
      !environment.publicKey ||
      !environment.applicationId ||
      !environment.guildId ||
      !environment.token
    ) {
      throw new Error("Environment variables not set");
    }
    return await this.webhook.handle(request, this.handler);
  };
}

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

export async function updateCommands(commands: Options["commands"]) {
  const rest = new Rest();
  const commandData = commands.map((c) => c.command);
  rest.bulkOverwriteGuildApplicationCommands(commandData);
  logger.base.info("Updated commands");
  return;
}
