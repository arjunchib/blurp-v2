export async function sha1(data: string) {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-1", enc.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
