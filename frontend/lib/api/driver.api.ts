import type { Shipment } from "@/lib/api/shipment.api";
import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

export const VEHICLE_TYPES = [
  "bike",
  "scooter",
  "car",
  "van",
  "pickup",
  "truck",
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const EMPLOYMENT_STATUSES = ["full-time", "part-time", "contract"] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const AVAILABILITY_STATUSES = [
  "available",
  "assigned",
  "on-delivery",
  "off-duty",
  "inactive",
] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export type Driver = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "driver";
  status: "active" | "inactive";
  licenseNumber: string;
  assignedVehicleId?: string | null;
  branch: string;
  employmentStatus: EmploymentStatus;
  availabilityStatus: AvailabilityStatus;
  deliveriesCount?: number;
  createdAt?: string;
};

export type AdminDriverStats = {
  total: number;
  onDelivery: number;
  offDuty: number;
  available: number;
  inactive: number;
};

export type DriverMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreateDriverPayload = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  licenseNumber?: string;
  branch?: string;
  employmentStatus?: EmploymentStatus;
  availabilityStatus?: AvailabilityStatus;
};

export type UpdateDriverPayload = Partial<
  CreateDriverPayload & { status: "active" | "inactive" }
>;

export type DriverStats = {
  total: number;
  active: number;
  deliveredToday: number;
  completed: number;
  codToCollect: number;
};

export type DriverVehicle = {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  make: string;
  model: string;
  capacityKg: number | null;
  status: string;
};

export type DriverProofPayload = {
  photo?: File;
  notes?: string;
  recipientName?: string;
};

export type DriverMe = Driver & { vehicle: DriverVehicle | null };

export async function adminGetDrivers(
  token: string,
  page: number,
  limit: number,
  search?: string,
  availability?: AvailabilityStatus | "",
): Promise<{ data: Driver[]; meta: DriverMeta }> {
  return authenticatedRequestWithMeta<Driver[], DriverMeta>(
    `/api/v1/admin/drivers${buildQueryString({
      page,
      limit,
      search,
      availability,
    })}`,
    token,
    { method: "GET" },
  );
}

export async function adminGetDriverStats(
  token: string,
): Promise<AdminDriverStats> {
  return authenticatedRequest<AdminDriverStats>(
    "/api/v1/admin/drivers/stats",
    token,
    { method: "GET" },
  );
}

export async function adminGetDriverById(
  token: string,
  id: string,
): Promise<Driver> {
  return authenticatedRequest<Driver>(`/api/v1/admin/drivers/${id}`, token, {
    method: "GET",
  });
}

export async function adminCreateDriver(
  token: string,
  payload: CreateDriverPayload,
): Promise<Driver> {
  return authenticatedRequest<Driver>("/api/v1/admin/drivers", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateDriver(
  token: string,
  id: string,
  payload: UpdateDriverPayload,
): Promise<Driver> {
  return authenticatedRequest<Driver>(`/api/v1/admin/drivers/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteDriver(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(`/api/v1/admin/drivers/${id}`, token, {
    method: "DELETE",
  });
}

export async function driverGetMe(token: string): Promise<DriverMe> {
  return authenticatedRequest<DriverMe>("/api/v1/driver/me", token, {
    method: "GET",
  });
}

export async function driverGetStats(token: string): Promise<DriverStats> {
  return authenticatedRequest<DriverStats>("/api/v1/driver/stats", token, {
    method: "GET",
  });
}

export async function driverGetAssignments(
  token: string,
  scope?: "active" | "history",
): Promise<Shipment[]> {
  return authenticatedRequest<Shipment[]>(
    `/api/v1/driver/shipments${buildQueryString({ scope })}`,
    token,
    { method: "GET" },
  );
}

export async function driverGetAssignment(
  token: string,
  id: string,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>(`/api/v1/driver/shipments/${id}`, token, {
    method: "GET",
  });
}

export async function driverUpdateStage(
  token: string,
  id: string,
  stage: string,
  note?: string,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>(
    `/api/v1/driver/shipments/${id}/stage`,
    token,
    { method: "PATCH", body: JSON.stringify({ stage, note }) },
  );
}

export async function driverCollectCod(
  token: string,
  id: string,
  collected: boolean,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>(
    `/api/v1/driver/shipments/${id}/cod`,
    token,
    { method: "PATCH", body: JSON.stringify({ collected }) },
  );
}

export async function driverSaveProof(
  token: string,
  id: string,
  payload: DriverProofPayload,
): Promise<Shipment> {
  const formData = new FormData();
  if (payload.photo) formData.append("proofPhoto", payload.photo);
  if (payload.notes !== undefined) formData.append("notes", payload.notes);
  if (payload.recipientName !== undefined) {
    formData.append("recipientName", payload.recipientName);
  }

  return authenticatedRequest<Shipment>(
    `/api/v1/driver/shipments/${id}/proof`,
    token,
    { method: "PATCH", body: formData },
  );
}

export async function driverDeleteProof(
  token: string,
  id: string,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>(
    `/api/v1/driver/shipments/${id}/proof`,
    token,
    { method: "DELETE" },
  );
}

export async function driverUpdateAvailability(
  token: string,
  availabilityStatus: "available" | "off-duty",
): Promise<Driver> {
  return authenticatedRequest<Driver>("/api/v1/driver/availability", token, {
    method: "PATCH",
    body: JSON.stringify({ availabilityStatus }),
  });
}
