import { updateCommands } from "@blurp/node";
import Tally from "../src/tally.js";
import Test from "../src/test.js";

await updateCommands({
  commands: [Tally, Test],
  global: !process.env.GUILD_ID,
});
