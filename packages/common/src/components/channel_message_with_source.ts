import {
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
} from "discord-api-types/v10";
import { replaceChildren, ReplaceKeys } from "../utils.js";

type ChannelMessageWithSourceProps = ReplaceKeys<
  APIInteractionResponseChannelMessageWithSource["data"],
  "components",
  "children"
>;

export function ChannelMessageWithSource(
  props: ChannelMessageWithSourceProps
): APIInteractionResponseChannelMessageWithSource {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: replaceChildren(props, "components"),
  };
}
