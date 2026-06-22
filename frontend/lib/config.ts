export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days