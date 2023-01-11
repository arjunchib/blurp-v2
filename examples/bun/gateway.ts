import { connectGateway, updateCommands } from "@blurp/bun";
import * as Test from "./commands/test.js";

const commands = [Test];

await updateCommands(commands);

connectGateway(commands);
