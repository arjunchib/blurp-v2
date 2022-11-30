import {
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
} from "../deps.ts";

interface ChannelMessageWithSourceChildren {
  children?: APIInteractionResponseChannelMessageWithSource["data"]["components"];
}

type ChannelMessageWithSourceProps = Omit<
  APIInteractionResponseChannelMessageWithSource["data"],
  "components"
> &
  ChannelMessageWithSourceChildren;

export function ChannelMessageWithSource(
  props: ChannelMessageWithSourceProps
): APIInteractionResponseChannelMessageWithSource {
  const data = {
    ...props,
    components: props.children,
  };
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data,
  };
}
