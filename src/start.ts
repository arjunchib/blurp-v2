import { Context } from "./context.ts";
import { Options } from "./types.ts";

export async function start(options?: Options) {
  const ctx = new Context(options || {});
  await ctx.start();
}
