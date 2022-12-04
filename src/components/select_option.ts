import { DistributiveOmit } from "https://deno.land/x/discord_api_types@0.37.17/utils/internals.ts";
import { APISelectMenuOption } from "../deps.ts";
import { replaceKeys } from "../utils.ts";

interface SelectOptionChildren {
  children: APISelectMenuOption["label"];
}

type SelectOptionProps = DistributiveOmit<APISelectMenuOption, "label"> &
  SelectOptionChildren;

export function SelectOption(props: SelectOptionProps): APISelectMenuOption {
  return replaceKeys(props, "children", "label");
}
