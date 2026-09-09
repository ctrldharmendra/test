import { io as ioClient } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = ioClient({
      path: "/api/socket_io", // backend wala same path
    });
  }
  return socket;
};