# Blurp

A Discord framework for Cloudflare Workers, Bun, Node, and Deno!

## Getting started

```ts
// main.ts
import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { serveWebhook } from "https://deno.land/x/blurp/mod.ts";
import * as Click from "./click.tsx";

await serve(serveWebhook([Click]));
```

```ts
// click.tsx
import {
  Command,
  Interaction,
  ChannelMessageWithSource,
  ActionRow,
  Button,
  UpdateMessage,
} from "blurp";
import { ButtonStyle, InteractionType } from "discord_api_types";

export const command: Command = {
  name: "click",
  description: "Click the button!",
};

export default async function Test(interaction: Interaction) {
  const { type } = interaction.payload;
  if (type === InteractionType.ApplicationCommand) {
    interaction.reply(
      <ChannelMessageWithSource>
        <ActionRow>
          <Button style={ButtonStyle.Primary} custom_id="test:button">
            Click me!
          </Button>
        </ActionRow>
      </ChannelMessageWithSource>
    );
  } else if (type === InteractionType.MessageComponent) {
    if (interaction.payload.data.custom_id === "test:button") {
      interaction.reply(
        <UpdateMessage content="Button Clicked"></UpdateMessage>
      );
    }
  }
}
```
