import { serveWebhook, updateCommands } from "@blurp/bun";
import * as Test from "./commands/test.js";

const commands = [Test];

await updateCommands(commands);

export default {
  port: 8787,
  fetch: serveWebhook(commands),
};
