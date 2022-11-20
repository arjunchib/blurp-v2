import { WebmOpusDemuxer } from "./lib/audio/mod.ts";
import {
  iterateReader,
  readerFromStreamReader,
} from "https://deno.land/std@0.165.0/streams/conversion.ts";

const file = await Deno.open("test.webm");
const rs = file.readable.pipeThrough(WebmOpusDemuxer);
const reader = readerFromStreamReader(rs.getReader());
for await (const chunk of iterateReader(reader)) {
  console.log(chunk);
  await sleep(20);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
