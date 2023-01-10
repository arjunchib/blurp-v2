import { serveWebhook } from "@blurp/cloudflare";
import * as Tally from "./tally.js";

export default {
  fetch: serveWebhook([Tally]),
};
