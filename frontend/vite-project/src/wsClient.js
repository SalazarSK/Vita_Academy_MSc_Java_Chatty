import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_API_URL + "/ws-chat";

export const connectWebSocket = (onConnected) => {
  const client = new Client({
    webSocketFactory: () =>
      new SockJS(WS_URL, null, { transports: ["websocket", "xhr-streaming"] }),
    reconnectDelay: 3000,
    debug: () => {},
  });

  client.onConnect = () => {
    console.log("WS CONNECTED");
    onConnected(client);
  };

  client.onStompError = (frame) => {
    console.error("STOMP Error:", frame.headers["message"]);
    console.error("Body:", frame.body);
  };

  client.onWebSocketClose = (event) => {
    console.warn("WebSocket closed:", event.reason || event);
  };

  client.onWebSocketError = (err) => {
    console.error("WebSocket error:", err);
  };

  client.activate();
  return client;
};

export const disconnectWebSocket = async (client) => {
  if (!client) return;
  try {
    await client.deactivate();
    console.log(" WS disconnected");
  } catch (e) {
    console.error("Error disconnecting WS", e);
  }
};
