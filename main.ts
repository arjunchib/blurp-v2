import { RESTGetAPIGatewayBotResult } from "discord-api-types/v10";
import {} from "tty";

const API_VERSION = 10;
const BASE_URL = `https://discord.com/api/v${API_VERSION}`;

const res = await fetch(`${BASE_URL}/gateway/bot`, {
  headers: {
    Authorization: `Bot ${process.env.TOKEN}`,
  },
});

const { url } = await res.json<RESTGetAPIGatewayBotResult>();

const params = new URLSearchParams({
  v: API_VERSION.toString(),
  encoding: "json",
});
const wsUrl = new URL(`${url}?${params}`);

const ws = new WebSocket(wsUrl);

ws.addEventListener("open", (event) => {
  console.log("Opened!");
});

ws.addEventListener("message", (event) => {
  console.log("Message from server ", JSON.parse(event.data));
});

setTimeout(() => {
  ws.close();
}, 50000);

export {};
