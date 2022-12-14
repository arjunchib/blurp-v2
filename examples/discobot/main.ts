import { start } from "disco";
import * as ColorPicker from "./commands/color-picker.tsx";
import * as Form from "./commands/form.tsx";
import * as Multiply from "./commands/multiply.tsx";
import * as Test from "./commands/test.tsx";

await start({
  commands: [ColorPicker, Form, Multiply, Test],
  logs: "DEBUG",
  useWebhooks: true,
});
