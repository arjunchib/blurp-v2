import { Rest, environment, CommandModule } from "@blurp/common/core";
import { APIApplicationCommand } from "discord-api-types/v10";

environment.token = process.env.TOKEN;
environment.applicationId = process.env.APPLICATION_ID;
environment.guildId = process.env.GUILD_ID;
environment.publicKey = process.env.PUBLIC_KEY;

const rest = new Rest();

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
