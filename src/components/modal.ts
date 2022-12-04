import {
  APIModalInteractionResponse,
  InteractionResponseType,
} from "../deps.ts";

interface ModalChildren {
  children:
    | APIModalInteractionResponse["data"]["components"]
    | NonNullable<APIModalInteractionResponse["data"]["components"]>[0];
}

type ModalProps = Omit<APIModalInteractionResponse["data"], "components"> &
  ModalChildren;

export function Modal(props: ModalProps): APIModalInteractionResponse {
  const { children } = props;
  const components = Array.isArray(children)
    ? children
    : ([children] as APIModalInteractionResponse["data"]["components"]);
  delete (props as Partial<ModalProps>).children;
  const data = {
    ...props,
    components,
  };
  return {
    type: InteractionResponseType.Modal,
    data,
  };
}
