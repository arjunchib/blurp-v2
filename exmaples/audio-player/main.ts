import { InteractionResponseType } from "../../lib/deps.ts";
import { DiscoClient } from "../../lib/client.ts";

const disco = new DiscoClient();

disco.onInteraction(async (payload) => {
  const voiceConn = await disco.voice.connect(
    "213484561127047168",
    "213484561127047169"
  );
  const file = await Deno.open("test.webm");
  voiceConn.playAudioStream(file.readable);
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
