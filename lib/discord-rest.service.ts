import {
  RESTGetAPIGatewayBotResult,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
} from "./deps.ts";
import { environment } from "./environment.ts";

export class DiscordRestService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `https://discord.com/api/v${environment.version}`;
  }

  private async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bot ${environment.token}`,
        "Content-Type": "application/json",
      },
      ...init,
    });
    return await res.json();
  }

  public async getGatewayBot() {
    return await this.fetch<RESTGetAPIGatewayBotResult>("/gateway/bot");
  }

  public async bulkOverwriteGuildApplicationCommands(
    commands: RESTPutAPIApplicationCommandsJSONBody
  ) {
    const { applicationId, guildId } = environment;
    await this.fetch<RESTPutAPIApplicationCommandsResult>(
      `/applications/${applicationId}/guilds/${guildId}/commands`,
      {
        body: JSON.stringify(commands),
        method: "PUT",
      }
    );
  }
}
