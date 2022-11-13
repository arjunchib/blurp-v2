import {
  RESTGetAPIGatewayBotResult,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
} from "discord-api-types";

export class DiscordRestService {
  private readonly baseUrl: string;

  constructor(
    private options: {
      version: number;
      token: string;
      applicationId: string;
      guildId: string;
    }
  ) {
    this.baseUrl = `https://discord.com/api/v${this.options.version}`;
  }

  private async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bot ${this.options.token}`,
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
    const { applicationId, guildId } = this.options;
    return await this.fetch<RESTPutAPIApplicationCommandsResult>(
      `/applications/${applicationId}/guilds/${guildId}/commands`,
      {
        body: JSON.stringify(commands),
        method: "PUT",
      }
    );
  }
}
