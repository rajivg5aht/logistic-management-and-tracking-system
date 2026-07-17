import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";

export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    console.error(
      `Could not reach MongoDB at ${MONGODB_URL}. ` +
        "Make sure MongoDB is running (e.g. start the 'MongoDB' service) " +
        "and that MONGO_URI in your .env is correct.",
    );
    throw error;
  }
};

export const connectToMongoDBTest = async (): Promise<void> => {
  const testUri =
    process.env.MONGO_URI_TEST || "mongodb://localhost:27017/logistics_test";
  try {
    await mongoose.connect(testUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB (test) connected successfully");
  } catch (error) {
    console.error("MongoDB (test) connection failed:", error);
    throw error;
  }
};

export const disconnectFromMongoDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 0) return;
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("MongoDB disconnection failed:", error);
    throw error;
  }
};