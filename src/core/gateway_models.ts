import {
  GatewayDispatchEvents,
  GatewayOpcodes,
  GatewayReceivePayload,
} from "../deps.ts";
import { PascalToSnakeCase } from "../utils.ts";

type KeyHelper<E, K extends keyof E, V> = K extends unknown
  ? E[K] extends V
    ? K
    : never
  : never;
type KeyName<E, V> = KeyHelper<E, keyof E, V>;

export type EventNames =
  | Uppercase<
      PascalToSnakeCase<
        KeyName<typeof GatewayOpcodes, GatewayReceivePayload["op"]>
      >
    >
  | `DISPATCH_${GatewayDispatchEvents}`;
