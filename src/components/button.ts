import { DistributiveOmit } from "https://deno.land/x/discord_api_types@0.37.17/utils/internals.ts";
import { APIButtonComponent, ComponentType } from "../deps.ts";

interface ButtonChildren {
  children: APIButtonComponent["label"];
}

type ButtonProps = DistributiveOmit<APIButtonComponent, "label" | "type"> &
  ButtonChildren;

export function Button(props: ButtonProps): APIButtonComponent {
  return {
    ...props,
    type: ComponentType.Button,
    label: props.children,
  };
}
