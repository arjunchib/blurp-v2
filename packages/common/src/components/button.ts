import { APIButtonComponent, ComponentType } from "discord-api-types/v10";
import { replaceChildren, ReplaceKeys, DistributiveOmit } from "../utils.js";

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
