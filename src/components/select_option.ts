import { APISelectMenuOption } from "../deps.ts";
import { replaceChildren, ReplaceKeys } from "../utils.ts";

type SelectOptionProps = ReplaceKeys<APISelectMenuOption, "label", "children">;

export function SelectOption(props: SelectOptionProps): APISelectMenuOption {
  return replaceChildren(props, "label");
}
