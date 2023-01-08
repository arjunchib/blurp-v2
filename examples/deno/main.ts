import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { Disco } from "disco";
import commands from "./commands/mod.ts";

const app = new Disco(commands);

await serve(app.fetch, { port: 8787 });
