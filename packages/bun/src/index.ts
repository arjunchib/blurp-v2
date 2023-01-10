import { APIApplicationCommand, APIInteraction } from "discord-api-types/v10";
import {
  Webhook,
  CommandResolver,
  Rest,
  environment,
  CommandModule,
  WebhookInteraction,
} from "@blurp/common/core";

declare global {
  const Bun: {
    env: {
      [name: string]: string;
    };
  };
}

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
      command?.(interaction);
      return await interaction.response;
    };
    return await webhook.handle(request, handler);
  };
};

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

export async function updateCommands(commands: CommandModule[]) {
  const data = await rest.getGuildApplicationCommands();
  const commandData = commands.map((c) => c.command);
  const commandsMatch = commandData.every((localCommand) => {
    const remoteCommand = data.find((c) => c.name === localCommand.name);
    if (!remoteCommand) return false;
    return compareCommands(localCommand, remoteCommand);
  });
  if (!commandsMatch) {
    await rest.bulkOverwriteGuildApplicationCommands(commandData);
    console.log("Updated commands");
  }
}
