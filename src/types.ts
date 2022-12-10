import { LevelName, LogConfig } from "https://deno.land/std@0.167.0/log/mod.ts";

export interface Options {
  commandDir?: string;
  logs?: LogConfig | LevelName | false;
}
