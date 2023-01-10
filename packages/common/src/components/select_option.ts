import { APISelectMenuOption } from "discord-api-types/v10";
import { replaceChildren, ReplaceKeys } from "../utils.js";

type SelectOptionProps = ReplaceKeys<APISelectMenuOption, "label", "children">;

export function SelectOption(props: SelectOptionProps): APISelectMenuOption {
  return replaceChildren(props, "label");
}
