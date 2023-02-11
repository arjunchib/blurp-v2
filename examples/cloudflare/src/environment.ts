import type { CloudflareContext } from "@blurp/cloudflare";

export type Context = CloudflareContext<{ TALLY_KV: KVNamespace }>;
