import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true, // match CORS setup
});

export default socket;
