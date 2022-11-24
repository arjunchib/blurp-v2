import { InteractionResponseType } from "../../lib/deps.ts";
import { DiscoClient } from "../../lib/client.ts";

const disco = new DiscoClient();

disco.onInteraction((payload) => {
  play();
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Congrats on sending your command, ${
        payload.d.member?.nick || "friendo"
      }!`,
    },
  };
});

async function play() {
  const voiceConn = await disco.voice.connect(
    "213484561127047168",
    "213484561127047169"
  );
  const file = await Deno.open("test.webm", { read: true });
  // Play audio stream consumes the file
  await voiceConn.playAudioStream(file.readable);
  voiceConn.disconnect();
}

await disco.run();
