import {
  APIModalInteractionResponse,
  InteractionResponseType,
} from "discord-api-types/v10";
import { replaceChildren, ReplaceKeys } from "../utils.js";

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
