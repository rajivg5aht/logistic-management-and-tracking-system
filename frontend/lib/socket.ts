"use client";

import { io, Socket } from "socket.io-client";

// Socket.IO connects straight to the backend origin — it does NOT ride the
// Next.js /api/v1 rewrite proxy that regular fetch calls use.
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;
let currentToken: string | null = null;

// Returns a shared Socket.IO connection authenticated with the given JWT.
// Reconnects if the token changes (e.g. a different user signs in).
export function getSocket(token: string): Socket {
  if (socket && currentToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
