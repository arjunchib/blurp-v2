import { start } from "disco";
import { command as TestCommand, default as Test } from "./commands/test.tsx";
import {
  command as MultiplyCommand,
  default as Multiply,
} from "./commands/multiply.tsx";
import { command as FormCommand, default as Form } from "./commands/form.tsx";
import {
  command as ColorPickerCommand,
  default as ColorPicker,
} from "./commands/color-picker.tsx";

start({
  commands: [
    [TestCommand, Test],
    [MultiplyCommand, Multiply],
    [FormCommand, Form],
    [ColorPickerCommand, ColorPicker],
  ],
});
