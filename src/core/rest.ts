import {
  RESTGetAPIGatewayBotResult,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPostAPIInteractionCallbackJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
} from "../deps.ts";
import { environment } from "../environment.ts";
import { logger } from "../logger.ts";

export class Rest {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `https://discord.com/api/v${environment.version}`;
  }

  private async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    try {
      logger.rest.debug(`${init?.method || "GET"} ${url} ${init?.body || ""}`);
      const res = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          Authorization: `Bot ${environment.token}`,
          "Content-Type": "application/json",
        },
        ...init,
      });
      const isJSON = res.headers
        .get("Content-Type")
        ?.startsWith("application/json");
      if (res.ok && isJSON) {
        const data = await res.json();
        logger.rest.debug(
          `${res.status} ${res.statusText} ${JSON.stringify(data)}`
        );
        return data;
      } else {
        const msg = `${res.status} ${res.statusText} ${await res.text()}`;
        res.ok ? logger.rest.debug(msg) : logger.rest.error(msg);
        return {} as T;
      }
    } catch (e) {
      logger.rest.error(e);
      return {} as T;
    }
  }

  public async getGatewayBot() {
    return await this.fetch<RESTGetAPIGatewayBotResult>("/gateway/bot");
  }

  public async bulkOverwriteGuildApplicationCommands(
    commands: RESTPutAPIApplicationCommandsJSONBody
  ) {
    const { applicationId, guildId } = environment;
    return await this.fetch<RESTPutAPIApplicationCommandsResult>(
      `/applications/${applicationId}/guilds/${guildId}/commands`,
      {
        body: JSON.stringify(commands),
        method: "PUT",
      }
    );
  }

  public async createInteractionResponse(
    interaction: { id: string; token: string },
    interactionResponse: RESTPostAPIInteractionCallbackJSONBody
  ) {
    const { id, token } = interaction;
    return await this.fetch(`/interactions/${id}/${token}/callback`, {
      body: JSON.stringify(interactionResponse),
      method: "POST",
    });
  }

  public async editOriginalInteractionResponse(
    interaction: { token: string },
    interactionResponse: RESTPatchAPIInteractionOriginalResponseJSONBody
  ) {
    const { applicationId } = environment;
    return await this.fetch(
      `/webhooks/${applicationId}/${interaction.token}/messages/@original`,
      {
        body: JSON.stringify(interactionResponse),
        method: "PATCH",
      }
    );
  }

  public async createFollowupMessage(
    interaction: { token: string },
    body: RESTPostAPIInteractionFollowupJSONBody
  ) {
    const { applicationId } = environment;
    return await this.fetch(`/webhooks/${applicationId}/${interaction.token}`, {
      body: JSON.stringify(body),
      method: "POST",
    });
  }
}
