import { DistributiveOmit } from "https://deno.land/x/discord_api_types@0.37.17/utils/internals.ts";
import { APIButtonComponent, ComponentType } from "../deps.ts";
import { replaceChildren, ReplaceKeys } from "../utils.ts";

type ButtonProps = ReplaceKeys<
  DistributiveOmit<APIButtonComponent, "type">,
  "label",
  "children"
>;

export function Button(props: ButtonProps): APIButtonComponent {
  return {
    type: ComponentType.Button,
    ...replaceChildren(props, "label"),
  };
}
