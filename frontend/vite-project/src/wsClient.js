import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_API_URL + "/ws-chat";

export const connectWebSocket = (onConnected) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    debug: () => {},
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    onConnected(client);
  };

  client.activate();
  return client;
};

export const disconnectWebSocket = async (client) => {
  if (!client) return;
  await client.deactivate();
};
