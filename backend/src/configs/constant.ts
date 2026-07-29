import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: [
    path.resolve(process.cwd(), "backend/.env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../../.env"),
  ],
  quiet: true,
});

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

const configuredCorsOrigins = parseOriginList(process.env.CORS_ORIGINS);
const configuredFrontendOrigins = parseOriginList(process.env.FRONTEND_ORIGIN);

export const CORS_ORIGINS: string[] =
  configuredCorsOrigins.length > 0
    ? configuredCorsOrigins
    : configuredFrontendOrigins.length > 0
      ? configuredFrontendOrigins
      : localOrigins;

export const FRONTEND_ORIGIN: string = CORS_ORIGINS[0];

// Email (used for password reset emails via nodemailer)
export const EMAIL_USER: string =
  process.env.EMAIL_USER || "example@gmail.com";

export const EMAIL_PASS: string = (process.env.EMAIL_PASS || "password123").replace(/\s/g, "");

// Base URL of the frontend, used to build the password reset link
export const CLIENT_URL: string = process.env.CLIENT_URL || FRONTEND_ORIGIN;

// Mistral Free mode supports this chat model with usage rate limits.
export const MISTRAL_API_KEY: string =
  process.env.MISTRAL_API_KEY?.trim() || "";
export const MISTRAL_MODEL: string =
  process.env.MISTRAL_MODEL || "mistral-small-latest";
export const MISTRAL_API_URL: string =
  process.env.MISTRAL_API_URL || "https://api.mistral.ai/v1";
