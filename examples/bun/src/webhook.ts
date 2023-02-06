import { serveWebhook, updateCommands } from "@blurp/bun";
import * as Tally from "./tally.js";

const commands = [Tally];

await updateCommands(commands);

export default {
  port: 8787,
  fetch: serveWebhook(commands),
};
