import { InteractionResponseType } from "../../lib/deps.ts";
import { DiscoClient } from "../../lib/client.ts";

const disco = new DiscoClient();

disco.onInteraction((payload) => {
  // discord.connectVoiceChannel("213484561127047168", "213484561127047169");
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Congrats on sending your command, ${
        payload.d.member?.nick || "friendo"
      }!`,
    },
  };
});

await disco.run();
