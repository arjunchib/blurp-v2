import {
  Rest,
  environment,
  CommandModule,
  Webhook,
  CommandResolver,
  WebhookInteraction,
} from "@blurp/common/core";
import { APIInteraction } from "discord-api-types/v10";
import { IncomingMessage, ServerResponse } from "node:http";
import type { Writable } from "node:stream";

export { updateCommands } from "@blurp/common";

environment.token = process.env.TOKEN;
environment.applicationId = process.env.APPLICATION_ID;
environment.guildId = process.env.GUILD_ID;
environment.publicKey = process.env.PUBLIC_KEY;

const rest = new Rest();

type FetchCallback = (request: Request) => Promise<unknown> | unknown;

export const serveWebhook = (commands: CommandModule[]) => {
  const webhook = new Webhook();
  const rest = new Rest();
  const resolver = new CommandResolver(commands);

  const fetchCallback = async (request: Request) => {
    const handler = async (apiInteraction: APIInteraction) => {
      const interaction = new WebhookInteraction(apiInteraction, rest);
      const command = resolver.resolve(apiInteraction);
      interaction.runCommand(command?.(interaction));
      return await interaction.response;
    };
    return await webhook.handle(request, handler);
  };

  return getRequestListener(fetchCallback);
};

// Thank you Hono :)

// https://github.com/honojs/node-server/blob/main/src/server.ts
const getRequestListener = (fetchCallback: FetchCallback) => {
  return async (incoming: IncomingMessage, outgoing: ServerResponse) => {
    const method = incoming.method || "GET";
    const url = `http://${incoming.headers.host}${incoming.url}`;

    const headerRecord: Record<string, string> = {};
    const len = incoming.rawHeaders.length;
    for (let i = 0; i < len; i++) {
      if (i % 2 === 0) {
        const key = incoming.rawHeaders[i];
        headerRecord[key] = incoming.rawHeaders[i + 1];
      }
    }

    const init = {
      method: method,
      headers: headerRecord,
    } as RequestInit;

    if (!(method === "GET" || method === "HEAD")) {
      const buffers = [];
      for await (const chunk of incoming) {
        buffers.push(chunk);
      }
      const buffer = Buffer.concat(buffers);
      init["body"] = buffer;
    }

    let res: Response;

    try {
      res = (await fetchCallback(
        new Request(url.toString(), init)
      )) as Response;
    } catch {
      res = new Response(null, { status: 500 });
    }

    const contentType = res.headers.get("content-type") || "";
    const contentEncoding = res.headers.get("content-encoding");

    for (const [k, v] of res.headers) {
      outgoing.setHeader(k, v);
    }
    outgoing.statusCode = res.status;

    if (res.body) {
      if (!contentEncoding && contentType.startsWith("text")) {
        outgoing.end(await res.text());
      } else if (
        !contentEncoding &&
        contentType.startsWith("application/json")
      ) {
        outgoing.end(await res.text());
      } else {
        await writeReadableStreamToWritable(res.body, outgoing);
      }
    } else {
      outgoing.end();
    }
  };
};

// https://github.com/honojs/node-server/blob/main/src/stream.ts
export async function writeReadableStreamToWritable(
  stream: ReadableStream,
  writable: Writable
) {
  let reader = stream.getReader();

  async function read() {
    let { done, value } = await reader.read();

    if (done) {
      writable.end();
      return;
    }

    writable.write(value);

    await read();
  }

  try {
    await read();
  } catch (error: any) {
    writable.destroy(error);
    throw error;
  }
}
