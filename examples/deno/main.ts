import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { serveWebhook } from "blurp";
import commands from "./commands/mod.ts";

await serve(serveWebhook(commands), { port: 8787 });
