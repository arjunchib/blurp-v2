import { APISelectMenuComponent, ComponentType } from "../deps.ts";
import { replaceChildren, ReplaceKeys } from "../utils.ts";

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
