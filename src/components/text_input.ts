import { DistributiveOmit } from "../utils.ts";
import { APITextInputComponent, ComponentType } from "../deps.ts";

type TextInputProps = DistributiveOmit<APITextInputComponent, "type">;

export function TextInput(props: TextInputProps): APITextInputComponent {
  return {
    type: ComponentType.TextInput,
    ...props,
  };
}
