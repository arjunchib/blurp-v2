import type { Context } from "./context/context.js";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Immutable } from "./utils.js";

export interface CommandModule {
  command: Command;
  default: Handler;
}

export type Command = Immutable<RESTPostAPIApplicationCommandsJSONBody>;

export type Handler = (
  Context: Context,
  ...args: any[]
) => void | Promise<void>;
