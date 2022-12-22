import { Rest } from "../core/rest.ts";
import { environment } from "../environment.ts";
import { logger } from "../logger.ts";
import { CommandModule } from "./common.ts";

environment.token = Deno.env.get("TOKEN");
environment.applicationId = Deno.env.get("APPLICATION_ID");
environment.guildId = Deno.env.get("GUILD_ID");
environment.publicKey = Deno.env.get("PUBLIC_KEY");

export async function updateCommands(commands: CommandModule[]) {
  console.log(environment);
  const rest = new Rest();
  const commandData = commands.map((c) => c.command);
  // Bail out if no localStorage (i.e. deno deploy)
  rest.bulkOverwriteGuildApplicationCommands(commandData);
  logger.base.info("Updated commands");
  return;
}
