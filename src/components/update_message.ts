import {
  APIInteractionResponseCallbackData,
  APIInteractionResponseUpdateMessage,
  InteractionResponseType,
} from "../deps.ts";
import { replaceChildren, ReplaceKeys } from "../utils.ts";

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
