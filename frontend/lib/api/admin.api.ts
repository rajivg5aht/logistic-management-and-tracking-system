import { AuthUser } from "./auth.api";

const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type AdminUserMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminUserPayload = {
  fullName: string;
  email: string;
  password?: string;
  role: "admin" | "customer" | "driver";
  phoneNumber?: string;
  status?: "active" | "inactive";
};

export async function adminGetUsers(
  token: string,
  page: number,
  limit: number,
  search?: string,
): Promise<{ data: AuthUser[]; meta: AdminUserMeta }> {
  let endpoint = `${API_BASE_URL}/api/v1/admin/users?page=${page}&limit=${limit}`;
  if (search) {
    endpoint += `&search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || "Failed to fetch users");
  }

  return {
    data: payload.data,
    meta: payload.meta,
  };
}

export async function adminGetUserById(
  token: string,
  id: string,
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || "Failed to fetch user");
  }

  return payload.data;
}

export async function adminCreateUser(
  token: string,
  payload: AdminUserPayload,
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to create user");
  }

  return data.data;
}

export async function adminUpdateUser(
  token: string,
  id: string,
  payload: Partial<AdminUserPayload>,
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to update user");
  }

  return data.data;
}

export async function adminDeleteUser(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to delete user");
  }
}
