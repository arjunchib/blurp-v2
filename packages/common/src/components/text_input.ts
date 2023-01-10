import { DistributiveOmit } from "../utils.js";
import { APITextInputComponent, ComponentType } from "discord-api-types/v10";

type TextInputProps = DistributiveOmit<APITextInputComponent, "type">;

export function TextInput(props: TextInputProps): APITextInputComponent {
  return {
    type: ComponentType.TextInput,
    ...props,
  };
}
