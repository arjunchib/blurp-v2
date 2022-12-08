// Helpers
export async function sha1(data: string) {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-1", enc.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export function randomNBit(numberOfBits: number) {
  return Math.floor(Math.random() * 2 ** numberOfBits);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export function replaceKeys<
  T,
  Old extends string | number | symbol,
  New extends string | number | symbol
>(object: T, oldKey: Old, newKey: New): ReplaceKeys<T, Old, New> {
  const { [oldKey]: oldValue, ...rest } = object;
  return {
    ...rest,
    [newKey]: oldValue,
  } as unknown as ReplaceKeys<T, Old, New>;
}

export function replaceChildren<
  T extends { children?: any },
  Key extends string | number | symbol
>(props: T, key: Key) {
  const keyNeedsWrapping = ["options", "components"].includes(key as string);
  if (keyNeedsWrapping && props.children && !Array.isArray(props.children)) {
    props.children = [props.children];
  }
  return replaceKeys(props, "children", key);
}

//Typescript helpers
export type OptionalPromise<T> = Promise<T> | T;

// https://stackoverflow.com/questions/60269936/typescript-convert-generic-object-from-snake-to-camel-case
export type CamelToSnakeCase<S extends string> =
  S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T>
        ? "_"
        : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
    : S;

export type PascalToSnakeCase<S extends string> = CamelToSnakeCase<
  Uncapitalize<S>
>;

// deno-lint-ignore ban-types, no-explicit-any
export type Constructor<T = {}> = new (...args: any[]) => T;

// https://stackoverflow.com/questions/57103834/typescript-omit-a-property-from-all-interfaces-in-a-union-but-keep-the-union-s
export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export type Replace<
  T extends string | number | symbol,
  Old extends string | number | symbol,
  New extends string | number | symbol
> = T extends Old ? New : T;

export type ReplaceKeys<
  T,
  Old extends string | number | symbol,
  New extends string | number | symbol
> = {
  [P in keyof T as Replace<P, Old, New>]: T[P];
};
