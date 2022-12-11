import { LevelName, LogConfig } from "https://deno.land/std@0.167.0/log/mod.ts";
import { Interaction } from "../mod.ts";
import { RESTPostAPIApplicationCommandsJSONBody } from "./deps.ts";

export interface Options {
  commands: {
    command: Command;
    default: (interaction: Interaction) => void;
  }[];
  logs?: LogConfig | LevelName | false;
}

export type Command = RESTPostAPIApplicationCommandsJSONBody;
