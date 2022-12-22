import { VoiceConn } from "./voice_conn.ts";
import { Gateway } from "./gateway.ts";

export class Voice {
  private voiceConnections = new Map<string, VoiceConn>();

  constructor(private gateway: Gateway) {}

  async connect(guildId: string, channelId: string): Promise<VoiceConn> {
    let voiceConn = this.voiceConnections.get(guildId);
    if (voiceConn && voiceConn.status === "open") {
      // Move channel
    } else {
      voiceConn = new VoiceConn(this.gateway, guildId);
      this.voiceConnections.set(guildId, voiceConn);
      await voiceConn.connect(channelId);
    }
    return voiceConn;
  }
}
