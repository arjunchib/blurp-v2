import { randomNBit } from "./utils.ts";
import { VoiceConnState } from "./voice_models.ts";
import {
  secretbox,
  randomBytes,
} from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";

const CHANNELS = 2;
const TIMESTAMP_INC = (48_000 / 100) * CHANNELS;
const MAX_NONCE_SIZE = 2 ** 32 - 1;

export class VoiceUdpConn {
  private socket?: Deno.DatagramConn;

  constructor(private state: VoiceConnState) {
    this.state.sequence = randomNBit(16);
    this.state.timestamp = randomNBit(32);
    this.socket = Deno.listenDatagram({
      port: 0,
      transport: "udp",
      hostname: "0.0.0.0",
    });
  }

  sendAudioPacket(opusPacket: Uint8Array) {
    const packet = this.createAudioPacket(opusPacket);
    this.socket?.send(packet, this.state.destAddr!);
  }

  close() {
    this.socket?.close();
  }

  async discoverIp() {
    if (!this.state.ssrc) throw new Error("No SSRC set");
    if (!this.state.destAddr) throw new Error("No destination address");
    if (!this.socket) throw new Error("No udp socket");

    const discoveryPacket = new DataView(new ArrayBuffer(74));
    discoveryPacket.setUint16(0, 1);
    discoveryPacket.setUint16(2, 70);
    discoveryPacket.setUint32(4, this.state.ssrc);

    await this.socket.send(
      new Uint8Array(discoveryPacket.buffer),
      this.state.destAddr
    );

    for await (const [packet, _] of this.socket) {
      if (new DataView(packet.subarray(0, 2).buffer).getInt16(0) === 0x02) {
        const dec = new TextDecoder();
        const nullByteIndex = packet
          .subarray(8)
          .findIndex((value) => value === 0);
        const end = nullByteIndex > 0 ? 8 + nullByteIndex : 72;
        const address = dec.decode(packet.subarray(8, end));
        const updView = new DataView(packet.buffer);
        const port = updView.getUint16(72);
        return { address, port };
      }
    }

    throw new Error("Couldn't discover IP address");
  }

  private createAudioPacket(opusPacket: Uint8Array) {
    const header = new Uint8Array(12);
    const headerView = new DataView(header.buffer);
    headerView.setUint8(0, 0x80);
    headerView.setUint8(1, 0x78);
    headerView.setUint16(2, this.state.sequence!);
    headerView.setUint32(4, this.state.timestamp!);
    headerView.setUint32(8, this.state.ssrc!);

    // console.log(
    //   `[audio] Sent packet`,
    //   this.sequence,
    //   this.timestamp,
    //   this.ssrc,
    //   this.nonce
    // );

    this.state.sequence!++;
    this.state.timestamp! += TIMESTAMP_INC;
    if (this.state.sequence! >= 2 ** 16) this.state.sequence = 0;
    if (this.state.timestamp! >= 2 ** 32) this.state.timestamp = 0;

    return Uint8Array.from([
      ...header,
      ...this.encryptOpusPacket(opusPacket, header),
    ]);
  }

  private encryptOpusPacket(opusPacket: Uint8Array, rtpHeader?: Uint8Array) {
    if (!this.state.secretKey) {
      throw new Error("No secret key");
    }
    if (this.state.encryptionMode === "xsalsa20_poly1305_lite") {
      this.state.nonce++;
      if (this.state.nonce > MAX_NONCE_SIZE) this.state.nonce = 0;
      const nonceBuffer = new Uint8Array(24);
      const nonceView = new DataView(nonceBuffer.buffer);
      nonceView.setUint32(0, this.state.nonce);
      return new Uint8Array([
        ...secretbox(opusPacket, nonceBuffer, this.state.secretKey),
        ...nonceBuffer.slice(0, 4),
      ]);
    } else if (this.state.encryptionMode === "xsalsa20_poly1305_suffix") {
      const random = randomBytes(24);
      return new Uint8Array([
        ...secretbox(opusPacket, random, this.state.secretKey),
        ...random,
      ]);
    }

    if (!rtpHeader) {
      throw new Error("No RTP header");
    }

    return secretbox(
      opusPacket,
      new Uint8Array([...rtpHeader, ...new Uint8Array(12)]),
      this.state.secretKey
    );
  }
}
