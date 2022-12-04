import { APISelectMenuComponent, ComponentType } from "../deps.ts";
import { replaceKeys, ReplaceKeys } from "../utils.ts";

type SelectMenuProps = ReplaceKeys<
  APISelectMenuComponent,
  "options",
  "children"
>;

export function SelectMenu(props: SelectMenuProps): APISelectMenuComponent {
  if (props.type === ComponentType.StringSelect) {
    return replaceKeys(props, "children", "options");
  }
  return props;
}
