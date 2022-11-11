import { RESTGetAPIGatewayBotResult } from "discord-api-types";

export class DiscordRestService {
  private readonly baseUrl: string;

  constructor(private options: { version: number; token: string }) {
    this.baseUrl = `https://discord.com/api/v${this.options.version}`;
  }

  private async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bot ${this.options.token}`,
      },
      ...init,
    });
    return await res.json();
  }

  public async getGatewayBot() {
    return await this.fetch<RESTGetAPIGatewayBotResult>("/gateway/bot");
  }
}
