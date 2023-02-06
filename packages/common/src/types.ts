import type { Interaction } from "./interaction/interaction.js";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export interface CommandModule {
  command: Command;
  default: Handler;
}

export type Command = RESTPostAPIApplicationCommandsJSONBody;
export type Handler = (
  Interaction: Interaction,
  ...args: any[]
) => void | Promise<void>;
