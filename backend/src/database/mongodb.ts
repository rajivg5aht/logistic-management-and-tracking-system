import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";

export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};