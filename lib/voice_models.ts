import { VoiceOpcodes } from "./deps.ts";
import { VoiceUdpConn } from "./voice_udp_conn.ts";
import { VoiceWsConn } from "./voice_ws_conn.ts";

export type VoicePayload =
  | VoiceReadyPayload
  | VoiceHelloPayload
  | VoiceSessionDescription;

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

export interface VoiceSessionDescription {
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
  destAddr?: Deno.NetAddr;
  endpoint?: string;
  token?: string;
}
