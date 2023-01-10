import {
  APIActionRowComponent,
  APIActionRowComponentTypes,
  ComponentType,
} from "discord-api-types/v10";
import { replaceChildren, ReplaceKeys } from "../utils.js";

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
