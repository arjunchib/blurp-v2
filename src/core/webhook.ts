import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";
import {
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponsePong,
  InteractionResponseType,
  InteractionType,
} from "../deps.ts";
import { logger } from "../logger.ts";
import { OptionalPromise } from "../utils.ts";
import { environment } from "../environment.ts";

/** Converts a hexadecimal string to Uint8Array. */
function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

type Handler = (
  interaction: APIInteraction
) => OptionalPromise<APIInteractionResponse>;

export class Webhook {
  async handle(req: Request, handler: Handler) {
    // logger.webhook.debug(`${req.method} ${res.status} ${res.statusText}`);
    // validate method
    if (req.method !== "POST") {
      return new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      });
    }

    // validate headers
    if (
      !req.headers.has("X-Signature-Ed25519") ||
      !req.headers.has("X-Signature-Timestamp")
    ) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    //  verify signature
    const { valid, body } = await this.verifySignature(req);
    if (!valid) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    // process request
    const interaction = JSON.parse(body) as APIInteraction;
    if (interaction.type === InteractionType.Ping) {
      const res: APIInteractionResponsePong = {
        type: InteractionResponseType.Pong,
      };
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const res = await handler(interaction);
      logger.webhook.debug(JSON.stringify(res));
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // fallback
    // return new Response(null, { status: 400, statusText: "Bad Request" });
  }

  /** Verify whether the request is coming from Discord. */
  private async verifySignature(
    request: Request
  ): Promise<{ valid: boolean; body: string }> {
    // Discord sends these headers with every request.
    const signature = request.headers.get("X-Signature-Ed25519")!;
    const timestamp = request.headers.get("X-Signature-Timestamp")!;
    const body = await request.text();
    const valid = nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + body),
      hexToUint8Array(signature),
      hexToUint8Array(environment.publicKey!)
    );
    return { valid, body };
  }
}
