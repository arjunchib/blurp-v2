import { Webhook } from "../core/webhook.ts";
import { CommandResolver } from "../command_resolver.ts";
import { APIInteraction } from "../deps.ts";
import { Rest } from "../core/rest.ts";
import { environment as discoEnv } from "../environment.ts";
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

export class Disco<Environment extends Record<string, string>> {
  private webhook = new Webhook();
  private rest = new Rest();
  private resolver: CommandResolver;
  private handler: Parameters<Webhook["handle"]>[1];
  private environment: any;

  constructor(commands: CommandModule[]) {
    this.resolver = new CommandResolver(commands);
    this.handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, this.rest);
      const command = this.resolver.resolve(apiInteraction);
      command?.(interaction, this.environment);
      return await interaction.response;
    };
  }

  async fetch(request: Request, environment: Environment, context: any) {
    discoEnv.applicationId = environment.APPLICATION_ID;
    discoEnv.guildId = environment.GUILD_ID;
    discoEnv.publicKey = environment.PUBLIC_KEY;
    discoEnv.token = environment.TOKEN;
    if (
      !discoEnv.publicKey ||
      !discoEnv.applicationId ||
      !discoEnv.guildId ||
      !discoEnv.token
    ) {
      throw new Error("Environment variables not set");
    }
    this.environment = environment;
    return await this.webhook.handle(request, this.handler);
  }
}
