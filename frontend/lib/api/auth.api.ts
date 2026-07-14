import { apiRequest, authenticatedRequest } from "@/lib/api/api-client";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  role: "admin" | "customer" | "driver";
  status?: string;
  createdAt?: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getWhoami(token: string): Promise<AuthUser> {
  return authenticatedRequest<AuthUser>("/api/v1/auth/whoami", token, {
    method: "GET",
  });
}

export type UpdateProfilePayload = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: File;
};

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload,
): Promise<AuthUser> {
  const formData = new FormData();

  if (payload.fullName) formData.append("fullName", payload.fullName);
  if (payload.email) formData.append("email", payload.email);
  if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
  if (payload.profileImage) formData.append("profileImage", payload.profileImage);

  return authenticatedRequest<AuthUser>("/api/v1/auth/update", token, {
    method: "PUT",
    body: formData,
  });
}

export type UpdatePasswordPayload = {
  password: string;
};

export async function updatePassword(
  token: string,
  payload: UpdatePasswordPayload,
): Promise<AuthUser> {
  return authenticatedRequest<AuthUser>("/api/v1/auth/update", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}