import {
  GatewayDispatchEvents,
  GatewayIntegrationCreateDispatch,
  InteractionResponseType,
} from "./lib/deps.ts";
import { DiscordClient } from "./lib/discord-client.ts";

const discord = new DiscordClient();

discord.on(GatewayDispatchEvents.InteractionCreate, async (payload) => {
  if (payload.t !== GatewayDispatchEvents.InteractionCreate) return;
  await discord.restService.createInteractionResponse(payload.d, {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: "Congrats on sending your command!",
    },
  });
});

await discord.run();
type asdac = GatewayIntegrationCreateDispatch;
