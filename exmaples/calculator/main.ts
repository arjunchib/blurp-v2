import { start } from "../../lib/disco.ts";
import { command as TestCommand, default as Test } from "./commands/test.tsx";
import {
  command as MultiplyCommand,
  default as Multiply,
} from "./commands/multiply.tsx";

start({
  commands: [
    [TestCommand, Test],
    [MultiplyCommand, Multiply],
  ],
});
