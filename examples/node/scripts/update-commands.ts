import { updateCommands } from "@blurp/node";
import * as Tally from "../src/tally.js";
import * as Test from "../src/test.js";

await updateCommands({
  commands: [Tally, Test],
  global: !process.env.GUILD_ID,
});
