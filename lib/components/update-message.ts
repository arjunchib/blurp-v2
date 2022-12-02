import {
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseUpdateMessage,
  InteractionResponseType,
} from "../deps.ts";

type UnwrapArray<T extends any[] | undefined> = NonNullable<T>[0];

interface UpdateMessageChildren {
  children?:
    | NonNullable<APIInteractionResponseUpdateMessage["data"]>["components"]
    | UnwrapArray<
        NonNullable<APIInteractionResponseUpdateMessage["data"]>["components"]
      >;
}

type UpdateMessageProps = Omit<
  NonNullable<APIInteractionResponseUpdateMessage["data"]>,
  "components"
> &
  UpdateMessageChildren;

export function UpdateMessage(
  props: UpdateMessageProps
): APIInteractionResponseUpdateMessage {
  const { children } = props;
  const components = children
    ? Array.isArray(children)
      ? children
      : ([
          children,
        ] as APIInteractionResponseChannelMessageWithSource["data"]["components"])
    : undefined;
  delete props.children;
  const data = {
    ...props,
    components,
  };
  return {
    type: InteractionResponseType.UpdateMessage,
    data,
  };
}
