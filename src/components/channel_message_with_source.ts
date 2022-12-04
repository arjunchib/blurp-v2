import {
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
} from "../deps.ts";

interface ChannelMessageWithSourceChildren {
  children?:
    | APIInteractionResponseChannelMessageWithSource["data"]["components"]
    | NonNullable<
        APIInteractionResponseChannelMessageWithSource["data"]["components"]
      >[0];
}

type ChannelMessageWithSourceProps = Omit<
  APIInteractionResponseChannelMessageWithSource["data"],
  "components"
> &
  ChannelMessageWithSourceChildren;

export function ChannelMessageWithSource(
  props: ChannelMessageWithSourceProps
): APIInteractionResponseChannelMessageWithSource {
  const { children } = props;
  const components =
    Array.isArray(children) || children == null
      ? children
      : ([
          children,
        ] as APIInteractionResponseChannelMessageWithSource["data"]["components"]);
  delete props.children;
  const data = {
    ...props,
    components,
  };
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data,
  };
}
