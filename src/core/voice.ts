import { Client } from "./client.ts";
import { VoiceConn } from "./voice_conn.ts";

export class Voice {
  private voiceConnections = new Map<string, VoiceConn>();

  constructor(private client: Client) {}

  async connect(guildId: string, channelId: string): Promise<VoiceConn> {
    let voiceConn = this.voiceConnections.get(guildId);
    if (voiceConn && voiceConn.status === "open") {
      // Move channel
    } else {
      voiceConn = new VoiceConn(this.client, guildId);
      this.voiceConnections.set(guildId, voiceConn);
      await voiceConn.connect(channelId);
    }
    return voiceConn;
  }
}
