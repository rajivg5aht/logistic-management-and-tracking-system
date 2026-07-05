import type { VehicleType } from "./driver.api";

const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const VEHICLE_STATUSES = [
  "available",
  "assigned",
  "maintenance",
  "inactive",
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export type Vehicle = {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  make: string;
  model: string;
  year?: number;
  capacityKg?: number;
  branch: string;
  status: VehicleStatus;
  insuranceExpiry: string | null;
  registrationExpiry: string | null;
  lastServiceAt: string | null;
  nextServiceAt: string | null;
  odometerKm: number;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignmentHistory: Array<{
    driverId: string;
    assignedAt: string;
    unassignedAt: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type VehiclePayload = {
  registrationNumber: string;
  type: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  capacityKg?: number;
  branch?: string;
  status?: VehicleStatus;
  insuranceExpiry?: string | null;
  registrationExpiry?: string | null;
  lastServiceAt?: string | null;
  nextServiceAt?: string | null;
  odometerKm?: number;
};

export type FleetStats = {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
  inactive: number;
};

export type FleetMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

async function authFetch(
  endpoint: string,
  token: string,
  init: RequestInit = {},
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...init,
  });
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || "Fleet request failed");
  }
  return payload;
}

export async function adminGetVehicles(
  token: string,
  page = 1,
  limit = 10,
  search = "",
  status: VehicleStatus | "" = "",
): Promise<{ data: Vehicle[]; meta: FleetMeta }> {
  let endpoint = `/api/v1/admin/vehicles?page=${page}&limit=${limit}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  if (status) endpoint += `&status=${status}`;
  const payload = await authFetch(endpoint, token);
  return { data: payload.data, meta: payload.meta };
}

export async function adminGetFleetStats(token: string): Promise<FleetStats> {
  const payload = await authFetch("/api/v1/admin/vehicles/stats", token);
  return payload.data;
}

export async function adminCreateVehicle(
  token: string,
  data: VehiclePayload,
): Promise<Vehicle> {
  const payload = await authFetch("/api/v1/admin/vehicles", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return payload.data;
}

export async function adminUpdateVehicle(
  token: string,
  id: string,
  data: Partial<Omit<VehiclePayload, "registrationNumber">>,
): Promise<Vehicle> {
  const payload = await authFetch(`/api/v1/admin/vehicles/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return payload.data;
}

export async function adminAssignVehicle(
  token: string,
  id: string,
  driverId: string | null,
): Promise<Vehicle> {
  const payload = await authFetch(
    `/api/v1/admin/vehicles/${id}/assignment`,
    token,
    { method: "PATCH", body: JSON.stringify({ driverId }) },
  );
  return payload.data;
}

export async function adminDeactivateVehicle(
  token: string,
  id: string,
): Promise<void> {
  await authFetch(`/api/v1/admin/vehicles/${id}`, token, {
    method: "DELETE",
  });
}
