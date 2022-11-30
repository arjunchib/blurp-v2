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
