import {
  GatewayDispatchEvents,
  GatewayOpcodes,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
  VoiceOpcodes,
} from "./deps.ts";
import { environment } from "./environment.ts";
import { WebmOpusDemuxer } from "./audio/mod.ts";
import { randomNBit } from "./utils.ts";
import {
  secretbox,
  randomBytes,
} from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";
import { DiscoClient } from "./client.ts";

type VoicePayload =
  | VoiceReadyPayload
  | VoiceHelloPayload
  | VoiceSessionDescription;

interface VoiceReadyPayload {
  op: VoiceOpcodes.Ready;
  d: {
    ssrc: number;
    ip: string;
    port: number;
    modes: string[];
    heartbeat_interval: number;
  };
}

interface VoiceHelloPayload {
  op: VoiceOpcodes.Hello;
  d: {
    heartbeat_interval: number;
  };
}

interface VoiceSessionDescription {
  op: VoiceOpcodes.SessionDescription;
  d: {
    mode: string;
    secret_key: number[];
  };
}

const CHANNELS = 2;
const TIMESTAMP_INC = (48_000 / 100) * CHANNELS;
const MAX_NONCE_SIZE = 2 ** 32 - 1;
const SUPPORTED_ENCRYPTION_MODES = [
  "xsalsa20_poly1305_lite",
  "xsalsa20_poly1305_suffix",
  "xsalsa20_poly1305",
];

export class Voice {
  private sessionId?: string;
  private ws?: WebSocket;
  private heartbeatIntervalId?: number;
  private ssrc?: number;
  private sequence?: number;
  private timestamp?: number;
  private secretKey?: Uint8Array;
  private encryptionMode?: string;
  private nonce = 0;
  private socket?: Deno.DatagramConn;
  private destAddr?: Deno.NetAddr;

  constructor(private client: DiscoClient) {}

  connect(guildId: string, channelId: string) {
    this.client.gateway.on(
      GatewayDispatchEvents.VoiceStateUpdate,
      (payload: GatewayVoiceStateUpdateDispatch) => {
        this.sessionId = payload.d.session_id;
      }
    );
    this.client.gateway.on(
      GatewayDispatchEvents.VoiceServerUpdate,
      (payload: GatewayVoiceServerUpdateDispatch) => {
        this.setupWebsocket(payload.d);
      }
    );
    this.client.gateway.send({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: {
        self_deaf: false,
        self_mute: false,
        guild_id: guildId,
        channel_id: channelId,
      },
    });
  }

  private send(payload: any) {
    console.log("[voice] Sent", VoiceOpcodes[payload.op]);
    this.ws?.send?.(JSON.stringify(payload));
  }

  private setupWebsocket(data: GatewayVoiceServerUpdateDispatch["d"]) {
    if (!this.sessionId) throw new Error("Session ID is not set");
    this.ws = new WebSocket(`wss://${data.endpoint}`);
    this.ws.addEventListener("open", () => {
      this.identify(data.guild_id, data.token);
    });
    this.ws.addEventListener("message", (event) => {
      this.handleMessage(JSON.parse(event.data));
    });
    this.ws.addEventListener("close", (event) => {
      console.log("Closed voice connection", event);
    });
  }

  private identify(guildId: string, token: string) {
    this.send({
      op: VoiceOpcodes.Identify,
      d: {
        server_id: guildId,
        user_id: environment.applicationId,
        session_id: this.sessionId,
        token,
      },
    });
  }

  private handleMessage(payload: VoicePayload) {
    console.log("[voice] Received", VoiceOpcodes[payload.op]);
    switch (payload.op) {
      case VoiceOpcodes.Hello:
        this.setupHeartbeat(payload);
        break;
      case VoiceOpcodes.Ready:
        this.setupUdpConn(payload);
        this.chooseEncryptionMode(payload.d.modes);
        break;
      case VoiceOpcodes.SessionDescription:
        this.encryptionMode = payload.d.mode;
        this.secretKey = new Uint8Array(payload.d.secret_key);
        console.log(`Mode is`, this.encryptionMode);
        console.log(`Secret key is`, this.secretKey);
        setTimeout(() => this.playAudio(), 0);
        break;
    }
  }

  private setupHeartbeat(payload: VoiceHelloPayload) {
    this.heartbeatIntervalId = setInterval(() => {
      this.heartbeat();
    }, payload.d.heartbeat_interval);
    this.heartbeat();
  }

  private heartbeat() {
    const nonce = crypto.getRandomValues(new Uint32Array(1))[0];
    this.send({
      op: VoiceOpcodes.Heartbeat,
      d: nonce,
    });
  }

  private async setupUdpConn(payload: VoiceReadyPayload) {
    this.destAddr = {
      transport: "udp",
      port: payload.d.port,
      hostname: payload.d.ip,
    };

    this.socket = await Deno.listenDatagram({
      port: 0,
      transport: "udp",
      hostname: "0.0.0.0",
    });

    const packet = new DataView(new ArrayBuffer(74));
    packet.setUint16(0, 1);
    packet.setUint16(2, 70);
    packet.setUint32(4, payload.d.ssrc);
    // packet.setUint16(72, payload.d.port);

    this.ssrc = payload.d.ssrc;
    this.sequence = randomNBit(16);
    this.timestamp = randomNBit(32);

    await this.socket.send(new Uint8Array(packet.buffer), this.destAddr);

    for await (const [data, addr] of this.socket) {
      if (new DataView(data.subarray(0, 2).buffer).getInt16(0) === 0x02) {
        this.selectProtocol(data);
      }
    }
  }

  private selectProtocol(udpPacket: Uint8Array) {
    const dec = new TextDecoder();
    const address = dec.decode(udpPacket.subarray(8, 72));
    const updView = new DataView(udpPacket.buffer);
    const port = updView.getUint16(72);
    console.log(`My Address is: ${address}:${port}`);
    this.send({
      op: 1,
      d: {
        protocol: "udp",
        data: {
          address,
          port,
          mode: this.encryptionMode,
        },
      },
    });
  }

  async playAudio() {
    this.send({
      op: 5,
      d: {
        speaking: 1,
        delay: 0,
        ssrc: this.ssrc,
      },
    });
    const file = await Deno.open("test.webm");
    const rs = file.readable.pipeThrough(WebmOpusDemuxer);
    // const reader = readerFromStreamReader(rs.getReader());
    // for await (const chunk of iterateReader(reader)) {
    //   const packet = this.createAudioPacket(chunk);
    //   this.socket?.send(packet, this.destAddr!);
    //   await sleep(20);
    // }

    const reader = rs.getReader();
    const intervalId = setInterval(async () => {
      const chunk = await reader.read();
      if (chunk.done) {
        clearInterval(intervalId);
        this.send({
          op: 5,
          d: {
            speaking: 0,
            delay: 0,
            ssrc: this.ssrc,
          },
        });
        return;
      }
      const packet = this.createAudioPacket(chunk.value);
      this.socket?.send(packet, this.destAddr!);
      console.log(
        `[audio] Sent packet ${this.destAddr?.hostname} ${packet.length}`
      );
    }, 20);
  }

  private chooseEncryptionMode(options: string[]) {
    this.encryptionMode = options.find((option) =>
      SUPPORTED_ENCRYPTION_MODES.includes(option)
    );
  }

  private createAudioPacket(opusPacket: Uint8Array) {
    const header = new Uint8Array(12);
    const headerView = new DataView(header.buffer);
    headerView.setUint8(0, 0x80);
    headerView.setUint8(1, 0x78);
    headerView.setUint16(2, this.sequence!);
    headerView.setUint32(4, this.timestamp!);
    headerView.setUint32(8, this.ssrc!);

    // console.log(
    //   `[audio] Sent packet`,
    //   this.sequence,
    //   this.timestamp,
    //   this.ssrc,
    //   this.nonce
    // );

    this.sequence!++;
    this.timestamp! += TIMESTAMP_INC;
    if (this.sequence! >= 2 ** 16) this.sequence = 0;
    if (this.timestamp! >= 2 ** 32) this.timestamp = 0;

    return Uint8Array.from([
      ...header,
      ...this.encryptOpusPacket(opusPacket, header),
    ]);
  }

  private encryptOpusPacket(opusPacket: Uint8Array, rtpHeader?: Uint8Array) {
    if (!this.secretKey) {
      throw new Error("No secret key");
    }
    if (this.encryptionMode === "xsalsa20_poly1305_lite") {
      this.nonce++;
      if (this.nonce > MAX_NONCE_SIZE) this.nonce = 0;
      const nonceBuffer = new Uint8Array(24);
      const nonceView = new DataView(nonceBuffer.buffer);
      nonceView.setUint32(0, this.nonce);
      return new Uint8Array([
        ...secretbox(opusPacket, nonceBuffer, this.secretKey),
        ...nonceBuffer.slice(0, 4),
      ]);
    } else if (this.encryptionMode === "xsalsa20_poly1305_suffix") {
      const random = randomBytes(24);
      return new Uint8Array([
        ...secretbox(opusPacket, random, this.secretKey),
        ...random,
      ]);
    }

    if (!rtpHeader) {
      throw new Error("No RTP header");
    }

    return secretbox(
      opusPacket,
      new Uint8Array([...rtpHeader, ...new Uint8Array(12)]),
      this.secretKey
    );
  }
}
