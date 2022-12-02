export const TOO_SHORT: unique symbol = Symbol("TOO_SHORT");

export function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const array = new Uint8Array(a.length + b.length);
  array.set(a);
  array.set(b, a.length);
  return array;
}

export function vintLength(buffer: Uint8Array, index: number) {
  if (index < 0 || index > buffer.length - 1) {
    return TOO_SHORT;
  }
  let i = 0;
  for (; i < 8; i++) if ((1 << (7 - i)) & buffer[index]) break;
  i++;
  if (index + i > buffer.length) {
    return TOO_SHORT;
  }
  return i;
}

export function expandVint(buffer: Uint8Array, start: number, end: number) {
  const length = vintLength(buffer, start);
  if (end > buffer.length || length === TOO_SHORT) return TOO_SHORT;
  const mask = (1 << (8 - length)) - 1;
  let value = buffer[start] & mask;
  for (let i = start + 1; i < end; i++) {
    value = (value << 8) + buffer[i];
  }
  return value;
}

export function toHex(array: Uint8Array): string {
  return [...array].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function equals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
