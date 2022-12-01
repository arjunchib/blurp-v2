import {
  APIActionRowComponent,
  APIActionRowComponentTypes,
  ComponentType,
} from "../deps.ts";

interface ActionRowChildren<T extends APIActionRowComponentTypes> {
  children:
    | APIActionRowComponent<T>["components"]
    | APIActionRowComponent<T>["components"][0];
}

type ActionRowProps<T extends APIActionRowComponentTypes> = Omit<
  APIActionRowComponent<T>,
  "components" | "type"
> &
  ActionRowChildren<T>;

export function ActionRow<T extends APIActionRowComponentTypes>(
  props: ActionRowProps<T>
): APIActionRowComponent<T> {
  const components = Array.isArray(props.children)
    ? props.children
    : [props.children];
  delete (props as Partial<ActionRowProps<T>>).children;
  return {
    ...props,
    type: ComponentType.ActionRow,
    components,
  };
}
