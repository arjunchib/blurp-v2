import { LevelName, LogConfig } from "https://deno.land/std@0.167.0/log/mod.ts";
import { Interaction } from "../mod.ts";
import { RESTPostAPIApplicationCommandsJSONBody } from "./deps.ts";

export interface Options {
  commands: {
    command: Command;
    default: Handler;
  }[];
  logs?: LogConfig | LevelName | false;
  useWebhooks?: boolean;
}

export type Command = RESTPostAPIApplicationCommandsJSONBody;
export type Handler = (Interaction: Interaction) => void;
