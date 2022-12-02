import { DiscoClient } from "../client.ts";
import {
  GatewayInteractionCreateDispatch,
  RESTPostAPIInteractionCallbackJSONBody,
} from "../deps.ts";
import { Constructor, OptionalPromise } from "../utils.ts";

export function OnInteraction<TBase extends Constructor<DiscoClient>>(
  Base: TBase
) {
  return class OnInteraction extends Base {
    onInteraction(
      fn: (
        payload: GatewayInteractionCreateDispatch
      ) => OptionalPromise<RESTPostAPIInteractionCallbackJSONBody>
    ) {
      const fnWrapper = async (payload: GatewayInteractionCreateDispatch) => {
        const res = await fn(payload);
        await this.rest.createInteractionResponse(payload.d, res);
      };
      this.gateway.events.addEventListener(
        "DISPATCH_INTERACTION_CREATE",
        fnWrapper
      );
    }
  };
}
