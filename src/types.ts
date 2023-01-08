import type { Interaction } from "./interaction/interaction.ts";
import type { RESTPostAPIApplicationCommandsJSONBody } from "./deps.ts";

export interface CommandModule {
  command: Command;
  default: Handler;
}

export interface Options {
  commands: CommandModule[];
}

export type Command = RESTPostAPIApplicationCommandsJSONBody;
export type Handler = (Interaction: Interaction, ...args: unknown[]) => void;
