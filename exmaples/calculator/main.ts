import { start } from "../../lib/disco.ts";
import { command as AddCommand, default as Add } from "./commands/add.ts";
import {
  command as MultiplyCommand,
  default as Multiply,
} from "./commands/multiply.tsx";

start({
  commands: [
    [AddCommand, Add],
    [MultiplyCommand, Multiply],
  ],
});
