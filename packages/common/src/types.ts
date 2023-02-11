import type { Context } from "./context/context.js";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export interface CommandModule {
  command: Command;
  default: Handler;
}

export type Command = RESTPostAPIApplicationCommandsJSONBody;
export type Handler = (
  Context: Context,
  ...args: any[]
) => void | Promise<void>;
