import { RESTPostAPIApplicationCommandsJSONBody } from "./deps.ts";
import { Interaction } from "./interaction.ts";

export interface Options {
  commands: [Command, (Interaction: Interaction) => void][];
}

export type Command = RESTPostAPIApplicationCommandsJSONBody;
