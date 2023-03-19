import { APIApplicationCommand } from "discord-api-types/v10";
import { Rest } from "./core.js";
import { Command, Meta } from "./command.js";

const rest = new Rest();

interface Options {
  commands: Command[];
  global?: boolean;
}

function compareCommands(
  localCommand: Meta,
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

export async function updateCommands(commands: Command[]): Promise<void>;
export async function updateCommands(options: Options): Promise<void>;
export async function updateCommands(input: Command[] | Options) {
  const options = Array.isArray(input) ? { commands: input } : input;
  const data = options.global
    ? await rest.getGlobalApplicationCommands()
    : await rest.getGuildApplicationCommands();
  const commandData = options.commands.map((c) => c.meta);
  const commandsMatch =
    commandData.length === data.length &&
    commandData.every((localCommand) => {
      const remoteCommand = data.find((c) => c.name === localCommand.name);
      if (!remoteCommand) return false;
      return compareCommands(localCommand, remoteCommand);
    });
  if (commandsMatch) return;
  if (options.global) {
    await rest.bulkOverwriteGlobalApplicationCommands(commandData);
  } else {
    await rest.bulkOverwriteGuildApplicationCommands(commandData);
  }
  console.log("Updated commands");
}
