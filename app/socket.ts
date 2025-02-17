import { io } from "socket.io-client";
export const socket = io("https://chesssocket-production.up.railway.app/", {
  autoConnect: false,
});
