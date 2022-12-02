import { DiscoClient } from "../client.ts";
import { RESTPutAPIApplicationCommandsJSONBody } from "../deps.ts";
import { Constructor, sha1 } from "../utils.ts";

export function UpdateCommands<TBase extends Constructor<DiscoClient>>(
  Base: TBase
) {
  return class UpdateCommands extends Base {
    async updateCommands(commands: RESTPutAPIApplicationCommandsJSONBody) {
      const hash = await sha1(JSON.stringify(commands));
      const storageKey = "commandHash";
      if (localStorage.getItem(storageKey) === hash) {
        console.log("Skipped updating commands");
      } else {
        localStorage.setItem(storageKey, hash);
        this.rest.bulkOverwriteGuildApplicationCommands(commands);
        console.log("Updated commands");
      }
    }
  };
}
