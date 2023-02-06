import { connectGateway, updateCommands } from "@blurp/bun";
import * as Tally from "./tally.js";

const commands = [Tally];

await updateCommands(commands);

connectGateway(commands);
