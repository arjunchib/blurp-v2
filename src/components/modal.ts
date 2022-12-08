import {
  APIModalInteractionResponse,
  InteractionResponseType,
} from "../deps.ts";
import { replaceChildren, ReplaceKeys } from "../utils.ts";

type ModalProps = ReplaceKeys<
  APIModalInteractionResponse["data"],
  "components",
  "children"
>;

export function Modal(props: ModalProps): APIModalInteractionResponse {
  return {
    type: InteractionResponseType.Modal,
    data: replaceChildren(props, "components"),
  };
}
