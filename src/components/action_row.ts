import {
  APIActionRowComponent,
  APIActionRowComponentTypes,
  ComponentType,
} from "../deps.ts";
import { replaceChildren, replaceKeys, ReplaceKeys } from "../utils.ts";

type ActionRowProps<T extends APIActionRowComponentTypes> = ReplaceKeys<
  Omit<APIActionRowComponent<T>, "type">,
  "components",
  "children"
>;

export function ActionRow<T extends APIActionRowComponentTypes>(
  props: ActionRowProps<T>
): APIActionRowComponent<T> {
  return {
    type: ComponentType.ActionRow,
    ...replaceChildren(props, "components"),
  };
}
