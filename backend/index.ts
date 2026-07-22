import http from "http";
import app from "./src/app";
import { MISTRAL_API_KEY, PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";
import { initSocketServer } from "./src/socket";

const startServer = async () => {
  try {
    await connectToMongoDB();

    const server = http.createServer(app);
    initSocketServer(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Mistral AI assistant: ${MISTRAL_API_KEY ? "configured" : "not configured"}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
