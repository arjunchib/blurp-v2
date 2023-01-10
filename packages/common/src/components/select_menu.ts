import { APISelectMenuComponent, ComponentType } from "discord-api-types/v10";
import { replaceChildren, ReplaceKeys } from "../utils.js";

type SelectMenuProps = ReplaceKeys<
  APISelectMenuComponent,
  "options",
  "children"
>;

export function SelectMenu(props: SelectMenuProps): APISelectMenuComponent {
  if (props.type === ComponentType.StringSelect) {
    return replaceChildren(props, "options");
  }
  return props;
}
