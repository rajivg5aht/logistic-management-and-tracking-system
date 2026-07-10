import dotenv from "dotenv";

dotenv.config();

const parseOriginList = (value?: string): string[] =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const localOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
];

const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required to start the API safely.");
}

export const PORT: number = Number(process.env.PORT) || 4000;

export const MONGODB_URL: string =
  process.env.MONGO_URI || "mongodb://localhost:27017/logistics";

export const SECRET_KEY: string = jwtSecret;

export const CORS_ORIGINS: string[] =
  parseOriginList(process.env.CORS_ORIGINS).length > 0
    ? parseOriginList(process.env.CORS_ORIGINS)
    : parseOriginList(process.env.FRONTEND_ORIGIN).length > 0
      ? parseOriginList(process.env.FRONTEND_ORIGIN)
      : localOrigins;

export const FRONTEND_ORIGIN: string = CORS_ORIGINS[0];
