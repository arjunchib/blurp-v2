import { Context } from "./context.ts";
import { DiscoClient } from "./core/client.ts";
import { Options } from "./types.ts";

export function start(options: Options) {
  const _ctx = new Context(options);
}
