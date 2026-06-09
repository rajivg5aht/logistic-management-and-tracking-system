import app from "./src/app";
import { PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";

const startServer = async () => {
  try {
    await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();