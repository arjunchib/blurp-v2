import {
  APIInteractionResponseCallbackData,
  APIInteractionResponseUpdateMessage,
  InteractionResponseType,
} from "discord-api-types/v10";
import { replaceChildren, ReplaceKeys } from "../utils.js";

type UpdateMessageProps = ReplaceKeys<
  APIInteractionResponseCallbackData,
  "components",
  "children"
>;

export function UpdateMessage(
  props: UpdateMessageProps
): APIInteractionResponseUpdateMessage {
  return {
    type: InteractionResponseType.UpdateMessage,
    data: replaceChildren(props, "components"),
  };
}
