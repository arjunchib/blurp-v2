import { DiscoClient } from "../client.ts";
import { Constructor } from "../utils.ts";
import { OnInteraction } from "./on_interaction.ts";
import { UpdateCommands } from "./update_commands.ts";

export function Commands<TBase extends Constructor<DiscoClient>>(Base: TBase) {
  return class Commands extends UpdateCommands(OnInteraction(Base)) {
    addCommand(command: any) {
      this.updateCommands([command]);
      this.onInteraction(command.handler);
    }
  };
}
