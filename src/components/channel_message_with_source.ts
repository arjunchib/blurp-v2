import {
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
} from "../deps.ts";
import { replaceChildren, ReplaceKeys } from "../utils.ts";

type ChannelMessageWithSourceProps = ReplaceKeys<
  APIInteractionResponseChannelMessageWithSource["data"],
  "components",
  "children"
>;

export function ChannelMessageWithSource(
  props: ChannelMessageWithSourceProps
): APIInteractionResponseChannelMessageWithSource {
  console.log(props);
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: replaceChildren(props, "components"),
  };
}
