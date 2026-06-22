import dotenv from "dotenv";

dotenv.config();

export const PORT: number = Number(process.env.PORT) || 4000;

export const MONGODB_URL: string =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/logistics";

export const SECRET_KEY: string =
  process.env.JWT_SECRET || process.env.SECRET_KEY || "merosecretkey";