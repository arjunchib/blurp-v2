import { DistributiveOmit } from "https://deno.land/x/discord_api_types@0.37.17/utils/internals.ts";
import { APITextInputComponent, ComponentType } from "../deps.ts";

type TextInputProps = DistributiveOmit<APITextInputComponent, "type">;

export function TextInput(props: TextInputProps): APITextInputComponent {
  return {
    ...props,
    type: ComponentType.TextInput,
  };
}
