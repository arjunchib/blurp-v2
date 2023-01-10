import { WebmBaseDemuxerTransformer } from "./webm-base-demuxer.js";
import { equals } from "./utils.js";

const OPUS_HEAD = Uint8Array.from([..."OpusHead"].map((x) => x.charCodeAt(0)));

export class WebmOpusDemuxerTransformer extends WebmBaseDemuxerTransformer {
  checkHead(data: Uint8Array) {
    if (!equals(data.slice(0, 8), OPUS_HEAD)) {
      throw Error("Audio codec is not Opus!");
    }
  }
}

export class WebmOpusDemuxer extends TransformStream {
  constructor() {
    super(new WebmOpusDemuxerTransformer());
  }
}
