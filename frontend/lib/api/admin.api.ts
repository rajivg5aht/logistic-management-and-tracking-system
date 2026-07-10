import { AuthUser } from "./auth.api";
import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

export type AdminUserMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminUserStats = {
  total: number;
  newSignups24h: number;
  signupsThisMonth: number;
  growthPct: number;
  registrationTrend: { label: string; count: number }[];
};

export type AdminUserPayload = {
  fullName: string;
  email: string;
  password?: string;
  role?: "customer";
  phoneNumber?: string;
  status?: "active" | "inactive";
};

export async function adminGetUsers(
  token: string,
  page: number,
  limit: number,
  search?: string,
  role?: "admin" | "customer" | "driver",
): Promise<{ data: AuthUser[]; meta: AdminUserMeta }> {
  return authenticatedRequestWithMeta<AuthUser[], AdminUserMeta>(
    `/api/v1/admin/users${buildQueryString({ page, limit, search, role })}`,
    token,
    { method: "GET" },
  );
}

export async function adminGetUserStats(
  token: string,
): Promise<AdminUserStats> {
  return authenticatedRequest<AdminUserStats>(
    "/api/v1/admin/users/stats",
    token,
    { method: "GET" },
  );
}

export async function adminGetUserById(
  token: string,
  id: string,
): Promise<AuthUser> {
  return authenticatedRequest<AuthUser>(`/api/v1/admin/users/${id}`, token, {
    method: "GET",
  });
}

export async function adminCreateUser(
  token: string,
  payload: AdminUserPayload,
): Promise<AuthUser> {
  return authenticatedRequest<AuthUser>("/api/v1/admin/users", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateUser(
  token: string,
  id: string,
  payload: Partial<AdminUserPayload>,
): Promise<AuthUser> {
  return authenticatedRequest<AuthUser>(`/api/v1/admin/users/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteUser(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(`/api/v1/admin/users/${id}`, token, {
    method: "DELETE",
  });
}
