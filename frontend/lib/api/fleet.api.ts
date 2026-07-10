import type { VehicleType } from "./driver.api";
import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

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
  imageUrl: string | null;
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

export async function adminGetVehicles(
  token: string,
  page = 1,
  limit = 10,
  search = "",
  status: VehicleStatus | "" = "",
): Promise<{ data: Vehicle[]; meta: FleetMeta }> {
  return authenticatedRequestWithMeta<Vehicle[], FleetMeta>(
    `/api/v1/admin/vehicles${buildQueryString({
      page,
      limit,
      search,
      status,
    })}`,
    token,
    { method: "GET" },
  );
}

export async function adminGetVehicleById(
  token: string,
  id: string,
): Promise<Vehicle> {
  return authenticatedRequest<Vehicle>(`/api/v1/admin/vehicles/${id}`, token, {
    method: "GET",
  });
}

export async function adminGetFleetStats(token: string): Promise<FleetStats> {
  return authenticatedRequest<FleetStats>(
    "/api/v1/admin/vehicles/stats",
    token,
    { method: "GET" },
  );
}

export async function adminCreateVehicle(
  token: string,
  data: VehiclePayload,
): Promise<Vehicle> {
  return authenticatedRequest<Vehicle>("/api/v1/admin/vehicles", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateVehicle(
  token: string,
  id: string,
  data: Partial<Omit<VehiclePayload, "registrationNumber">>,
): Promise<Vehicle> {
  return authenticatedRequest<Vehicle>(`/api/v1/admin/vehicles/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminAssignVehicle(
  token: string,
  id: string,
  driverId: string | null,
): Promise<Vehicle> {
  return authenticatedRequest<Vehicle>(
    `/api/v1/admin/vehicles/${id}/assignment`,
    token,
    { method: "PATCH", body: JSON.stringify({ driverId }) },
  );
}

export async function adminDeactivateVehicle(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(`/api/v1/admin/vehicles/${id}`, token, {
    method: "DELETE",
  });
}

export async function adminRemoveVehicle(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(
    `/api/v1/admin/vehicles/${id}/permanent`,
    token,
    { method: "DELETE" },
  );
}

export async function adminUploadVehicleImage(
  token: string,
  id: string,
  file: File,
): Promise<Vehicle> {
  const formData = new FormData();
  formData.append("image", file);

  return authenticatedRequest<Vehicle>(
    `/api/v1/admin/vehicles/${id}/image`,
    token,
    { method: "POST", body: formData },
  );
}
