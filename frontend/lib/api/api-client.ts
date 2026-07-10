import { API_BASE_URL as SERVER_API_BASE_URL } from "@/lib/config";

// Use relative URLs in the browser so requests flow through Next.js rewrites.
// Server-side calls need the backend origin because there is no browser proxy.
export const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : SERVER_API_BASE_URL;

export type ApiResponse<T, TMeta = unknown> = {
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {};

  if (!headers) return normalized;

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      normalized[key] = value;
    }
    return normalized;
  }

  return { ...headers };
}

function buildHeaders(
  options: RequestInit,
  token?: string,
): Record<string, string> {
  const isFormData = options.body instanceof FormData;
  const headers = normalizeHeaders(options.headers);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function readPayload<T, TMeta>(
  response: Response,
): Promise<ApiResponse<T, TMeta>> {
  let payload: ApiResponse<T, TMeta>;

  try {
    payload = (await response.json()) as ApiResponse<T, TMeta>;
  } catch {
    throw new ApiError(
      response.statusText || "Request failed",
      response.status,
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(
      payload.message || response.statusText || "Request failed",
      payload.status || response.status,
    );
  }

  return payload;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function apiResponse<T, TMeta = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T, TMeta>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options),
    credentials: "include",
  });

  return readPayload<T, TMeta>(response);
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const payload = await apiResponse<T>(endpoint, options);
  return payload.data;
}

export async function apiRequestWithMeta<T, TMeta>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T; meta: TMeta }> {
  const payload = await apiResponse<T, TMeta>(endpoint, options);

  return {
    data: payload.data,
    meta: payload.meta as TMeta,
  };
}

export async function authenticatedResponse<T, TMeta = unknown>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<ApiResponse<T, TMeta>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options, token),
    credentials: "include",
  });

  return readPayload<T, TMeta>(response);
}

export async function authenticatedRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const payload = await authenticatedResponse<T>(endpoint, token, options);
  return payload.data;
}

export async function authenticatedRequestWithMeta<T, TMeta>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<{ data: T; meta: TMeta }> {
  const payload = await authenticatedResponse<T, TMeta>(
    endpoint,
    token,
    options,
  );

  return {
    data: payload.data,
    meta: payload.meta as TMeta,
  };
}
