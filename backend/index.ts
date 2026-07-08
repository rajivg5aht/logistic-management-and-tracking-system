import http from "http";
import app from "./src/app";
import { PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";
import { initSocketServer } from "./src/socket";

const startServer = async () => {
  try {
    await connectToMongoDB();

    // Wrap Express in an HTTP server so Socket.IO can share the same port.
    const server = http.createServer(app);
    initSocketServer(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
