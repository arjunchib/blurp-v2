import { VoiceOpcodes } from "discord-api-types/voice";
import { VoiceUdpConn } from "./voice_udp_conn.js";
import { VoiceWsConn } from "./voice_ws_conn.js";

export type VoicePayload =
  | VoiceReadyPayload
  | VoiceHelloPayload
  | VoiceSessionDescriptionPayload;

export interface VoiceReadyPayload {
  op: VoiceOpcodes.Ready;
  d: {
    ssrc: number;
    ip: string;
    port: number;
    modes: string[];
    heartbeat_interval: number;
  };
}

export interface VoiceHelloPayload {
  op: VoiceOpcodes.Hello;
  d: {
    heartbeat_interval: number;
  };
}

export interface VoiceSessionDescriptionPayload {
  op: VoiceOpcodes.SessionDescription;
  d: {
    mode: string;
    secret_key: number[];
  };
}

export interface VoiceConnState {
  nonce: number;
  guildId: string;
  ws?: VoiceWsConn;
  udp?: VoiceUdpConn;
  sessionId?: string;
  ssrc?: number;
  sequence?: number;
  timestamp?: number;
  secretKey?: Uint8Array;
  encryptionMode?: string;
  destAddr?: {
    transport: "udp";
    port: number;
    hostname: string;
  };
  endpoint?: string;
  token?: string;
  connectedResolve?: (value: void | PromiseLike<void>) => void;
}
