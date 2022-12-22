import { Webhook } from "../core/webhook.ts";
import { CommandResolver } from "../command_resolver.ts";
import { APIInteraction } from "../deps.ts";
import { Rest } from "../core/rest.ts";
import { environment } from "../environment.ts";
import { CommandModule, WebhookInteraction } from "./common.ts";

// Components
export { ChannelMessageWithSource } from "../components/channel_message_with_source.ts";
export { ActionRow } from "../components/action_row.ts";
export { Button } from "../components/button.ts";
export { UpdateMessage } from "../components/update_message.ts";
export { Modal } from "../components/modal.ts";
export { TextInput } from "../components/text_input.ts";
export { SelectMenu } from "../components/select_menu.ts";
export { SelectOption } from "../components/select_option.ts";

// Types
export type { Command, Interaction } from "./common.ts";

// environment.token = Deno.env.get("TOKEN");
// environment.applicationId = Deno.env.get("APPLICATION_ID");
// environment.guildId = Deno.env.get("GUILD_ID");
// environment.publicKey = Deno.env.get("PUBLIC_KEY");

declare global {
  const Bun: {
    env: {
      [name: string]: string;
    };
  };
}

if (Bun) {
  environment.token = Bun.env.TOKEN;
  environment.applicationId = Bun.env.APPLICATION_ID;
  environment.guildId = Bun.env.GUILD_ID;
  environment.publicKey = Bun.env.PUBLIC_KEY;
}

export class Disco {
  port = 8787;
  private webhook = new Webhook();
  private rest = new Rest();
  private resolver: CommandResolver;
  private handler: Parameters<Webhook["handle"]>[1];

  constructor(commands: CommandModule[]) {
    this.resolver = new CommandResolver(commands);
    this.handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, this.rest);
      const command = this.resolver.resolve(apiInteraction);
      command?.(interaction);
      return await interaction.response;
    };
  }

  async fetch(request: Request) {
    console.log(request.url);
    if (
      !environment.publicKey ||
      !environment.applicationId ||
      !environment.guildId ||
      !environment.token
    ) {
      throw new Error("Environment variables not set");
    }
    return await this.webhook.handle(request, this.handler);
  }
}
