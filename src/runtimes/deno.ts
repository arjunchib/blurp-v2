// Auto-load dotenv vars
import "https://deno.land/std@0.167.0/dotenv/load.ts";
import { serve as httpServe } from "https://deno.land/std@0.167.0/http/server.ts";
import { Webhook } from "../core/webhook.ts";
import { CommandResolver } from "../command_resolver.ts";
import { Options } from "../types.ts";
import { APIInteraction, GatewayInteractionCreateDispatch } from "../deps.ts";
import { WebhookInteraction } from "../interaction/webhook-interaction.ts";
import { Rest } from "../core/rest.ts";
import { Gateway } from "../core/gateway.ts";
import { GatewayInteraction } from "../interaction/gateway-interaction.ts";
import { sha1 } from "../utils.ts";
import { environment } from "../environment.ts";
import { logger } from "../logger.ts";

environment.token = Deno.env.get("TOKEN");
environment.applicationId = Deno.env.get("APPLICATION_ID");
environment.guildId = Deno.env.get("GUILD_ID");
environment.publicKey = Deno.env.get("PUBLIC_KEY");

export async function startWebhook(options: Options) {
  if (!environment.publicKey) {
    throw new Error("Environment variables not set");
  }
  const serve = Deno.serve || httpServe;
  const webhook = new Webhook();
  const resolver = new CommandResolver(options.commands);
  const rest = new Rest();
  const handler = async (apiInteraction: APIInteraction) => {
    const interaction = new WebhookInteraction(apiInteraction, rest);
    const command = resolver.resolve(apiInteraction);
    command?.(interaction);
    return await interaction.response;
  };
  await serve(
    async (req) => {
      return await webhook.handle(req, handler);
    },
    { port: 9000 }
  );
}

export function startGateway(options: Options) {
  if (
    !environment.applicationId ||
    !environment.guildId ||
    !environment.token
  ) {
    throw new Error("Environment variables not set");
  }
  const rest = new Rest();
  const gateway = new Gateway(rest);
  const resolver = new CommandResolver(options.commands);
  gateway.connect();
  gateway.events.addEventListener(
    "DISPATCH_INTERACTION_CREATE",
    (payload: GatewayInteractionCreateDispatch) => {
      const interaction = new GatewayInteraction(payload.d, rest);
      const command = resolver.resolve(payload.d);
      command?.(interaction);
    }
  );
}

// export async function updateCommands(commands: Options["commands"]) {
//   const rest = new Rest();
//   const commandData = commands.map((c) => c.command);
//   const hash = await sha1(JSON.stringify(commands));
//   const storageKey = "commandHash";
//   // Bail out if no localStorage (i.e. deno deploy)
//   if (!window.localStorage) {
//     rest.bulkOverwriteGuildApplicationCommands(commandData);
//     logger.base.info("Updated commands");
//     return;
//   }
//   if (window.localStorage.getItem(storageKey) === hash) {
//     logger.base.info("Skipped updating commands");
//   } else {
//     window.localStorage.setItem(storageKey, hash);
//     rest.bulkOverwriteGuildApplicationCommands(commandData);
//     logger.base.info("Updated commands");
//   }
// }
