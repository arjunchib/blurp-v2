import { concat, vintLength, expandVint, TOO_SHORT, toHex } from "./utils.js";

const TAGS = {
  // value is true if the element has children
  "1a45dfa3": true, // EBML
  "18538067": true, // Segment
  "1f43b675": true, // Cluster
  "1654ae6b": true, // Tracks
  ae: true, // TrackEntry
  d7: false, // TrackNumber
  "83": false, // TrackType
  a3: false, // SimpleBlock
  "63a2": false,
} as const;

function keyOfTAGS(key: string): key is keyof typeof TAGS {
  return typeof TAGS[key as keyof typeof TAGS] !== "undefined";
}

interface Track {
  number?: number;
  type?: number;
}

export abstract class WebmBaseDemuxerTransformer implements Transformer {
  abstract checkHead(data: Uint8Array): void;
  private remainder: Uint8Array | null = null;
  private length = 0;
  private count = 0;
  private skipUntil: number | null = null;
  private track: Track | null = null;
  private incompleteTrack: Track = {};
  private ebmlFound = false;

  start() {}

  transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
    this.length += chunk.length;
    if (this.remainder) {
      chunk = concat(this.remainder, chunk);
      this.remainder = null;
    }
    let offset = 0;
    if (this.skipUntil && this.length > this.skipUntil) {
      offset = this.skipUntil - this.count;
      this.skipUntil = null;
    } else if (this.skipUntil) {
      this.count += chunk.length;
      return;
    }
    let result: ReturnType<typeof this.readTag> | undefined;
    while (result !== TOO_SHORT) {
      try {
        result = this.readTag(chunk, offset, controller);
      } catch (error) {
        controller.error(error);
        return;
      }
      if (result === TOO_SHORT) break;
      if (result.skipUntil) {
        this.skipUntil = result.skipUntil;
        break;
      }
      if (result.offset) offset = result.offset;
      else break;
    }
    this.count += offset;
    this.remainder = chunk.slice(offset);
    return;
  }

  flush(_controller: TransformStreamDefaultController) {
    this.remainder = null;
    this.incompleteTrack = {};
  }

  private readTag(
    chunk: Uint8Array,
    offset: number,
    controller: TransformStreamDefaultController
  ):
    | {
        offset: number;
        skipUntil?: number;
      }
    | typeof TOO_SHORT {
    const idData = this.readEBMLId(chunk, offset);
    if (idData === TOO_SHORT) {
      return TOO_SHORT;
    }
    const ebmlID = toHex(idData.id);
    if (!this.ebmlFound) {
      if (ebmlID === "1a45dfa3") this.ebmlFound = true;
      else throw Error("Did not find the EBML tag at the start of the stream");
    }
    offset = idData.offset;
    const sizeData = this.readTagDataSize(chunk, offset);
    if (sizeData === TOO_SHORT) {
      return TOO_SHORT;
    }
    const { dataLength } = sizeData;
    offset = sizeData.offset;
    // If this tag isn't useful, tell the stream to stop processing data until the tag ends
    if (!keyOfTAGS(ebmlID)) {
      if (chunk.length > offset + dataLength) {
        return { offset: offset + dataLength };
      }
      return { offset, skipUntil: this.count + offset + dataLength };
    }

    const tagHasChildren = TAGS[ebmlID];
    if (tagHasChildren) {
      return { offset };
    }

    if (offset + dataLength > chunk.length) {
      return TOO_SHORT;
    }
    const data = chunk.slice(offset, offset + dataLength);
    if (!this.track) {
      if (ebmlID === "ae") this.incompleteTrack = {};
      if (ebmlID === "d7") this.incompleteTrack.number = data[0];
      if (ebmlID === "83") this.incompleteTrack.type = data[0];
      if (
        this.incompleteTrack.type === 2 &&
        typeof this.incompleteTrack.number !== "undefined"
      ) {
        this.track = this.incompleteTrack;
      }
    }
    if (ebmlID === "63a2") {
      this.checkHead(data);
      // this.emit("head", data);
    } else if (ebmlID === "a3") {
      if (!this.track) throw Error("No audio track in this webm!");
      if ((data[0] & 0xf) === this.track.number) {
        controller.enqueue(data.slice(4));
      }
    }
    return { offset: offset + dataLength };
  }

  private readEBMLId(
    chunk: Uint8Array,
    offset: number
  ): { id: Uint8Array; offset: number } | typeof TOO_SHORT {
    const idLength = vintLength(chunk, offset);
    if (idLength === TOO_SHORT) return TOO_SHORT;
    return {
      id: chunk.slice(offset, offset + idLength),
      offset: offset + idLength,
    };
  }

  private readTagDataSize(chunk: Uint8Array, offset: number) {
    const sizeLength = vintLength(chunk, offset);
    if (sizeLength === TOO_SHORT) return TOO_SHORT;
    const dataLength = expandVint(chunk, offset, offset + sizeLength);
    // Modified for typescript
    if (dataLength === TOO_SHORT) return TOO_SHORT;
    return { offset: offset + sizeLength, dataLength, sizeLength };
  }
}
