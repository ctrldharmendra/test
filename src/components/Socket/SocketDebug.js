// components/SocketDebug.js
"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export default function SocketDebug() {
  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("✅ MERA SOCKET CONNECTED, ID:", socket.id);
    });

    socket.on("post:like-updated", (data) => {
      console.log("🔥 EVENT MILA:", data);
    });
  }, []);

  return null;
}