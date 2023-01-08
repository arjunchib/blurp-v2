import { Rest } from "../core/rest.ts";
import { environment } from "../environment.ts";
import { CommandModule } from "../common.ts";
import { APIApplicationCommand } from "../deps.ts";

environment.token = Deno.env.get("TOKEN");
environment.applicationId = Deno.env.get("APPLICATION_ID");
environment.guildId = Deno.env.get("GUILD_ID");
environment.publicKey = Deno.env.get("PUBLIC_KEY");

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
