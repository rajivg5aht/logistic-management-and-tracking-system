// Temporary runtime smoke server: boots Express + Socket.IO WITHOUT a DB so a
// client can exercise the JWT handshake gate. Stays up until killed.
import http from "http";
import app from "./src/app";
import { initSocketServer } from "./src/socket";

const PORT = 4999;
const server = http.createServer(app);
initSocketServer(server);
server.listen(PORT, () => {
  console.log("SMOKE LISTENING", PORT);
});
