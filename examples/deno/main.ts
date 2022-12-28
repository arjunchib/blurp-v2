import { startWebhook } from "disco";
import * as ColorPicker from "./commands/color-picker.tsx";
import * as Form from "./commands/form.tsx";
import * as Multiply from "./commands/multiply.tsx";
import * as Test from "./commands/test.tsx";

const commands = [ColorPicker, Form, Multiply, Test];

await startWebhook({
  commands,
});
