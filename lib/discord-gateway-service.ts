import { DiscordRestService } from "./discord-rest-service";

export class DiscordGatewayService {
  ws: WebSocket;

  constructor(
    private version: number,
    private restService: DiscordRestService
  ) {}

  public async connect() {
    const { url } = await this.restService.getGatewayBot();
    const params = new URLSearchParams({
      v: this.version.toString(),
      encoding: "json",
    });
    const wsUrl = new URL(`${url}?${params}`);
    this.ws = new WebSocket(wsUrl);
    this.ws.addEventListener("open", (event) => {
      console.log("Opened!");
    });
    this.ws.addEventListener("message", (event) => {
      console.log("Message from server ", JSON.parse(event.data));
    });
    setTimeout(() => {
      this.ws.close();
    }, 50000);
  }
}
