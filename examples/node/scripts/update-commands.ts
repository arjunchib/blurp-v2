import { updateCommands } from "@blurp/node";
import * as Tally from "../src/tally.js";

await updateCommands({
  commands: [Tally],
  global: true,
});

await updateCommands({
  commands: [],
  global: false,
});
