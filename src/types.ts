import { RESTPostAPIApplicationCommandsJSONBody } from "./deps.ts";
import { Interaction } from "./interaction.ts";

export interface Options {
  commands?: [Command, (Interaction: Interaction) => void][];
  commandDir?: string;
}

export type Command = RESTPostAPIApplicationCommandsJSONBody;
