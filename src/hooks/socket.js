import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"], // Prefer WS, fallback to polling
});

socket.onAny((event, ...args) => {
  console.log(`[SOCKET EVENT]: ${event}`, args); // Log ALL events for debug
});

export default socket;
