import type { Shipment } from "@/lib/api/shipment.api";

const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

// The signed-in driver's own profile + their assigned vehicle (GET /driver/me).
export type DriverMe = Driver & { vehicle: DriverVehicle | null };

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
    throw new Error(payload.message || "Request failed");
  }
  return payload;
}

// ── Admin: driver management ─────────────────────────────────────────────────
export async function adminGetDrivers(
  token: string,
  page: number,
  limit: number,
  search?: string,
  availability?: AvailabilityStatus | "",
): Promise<{ data: Driver[]; meta: DriverMeta }> {
  let endpoint = `/api/v1/admin/drivers?page=${page}&limit=${limit}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  if (availability) endpoint += `&availability=${availability}`;

  const payload = await authFetch(endpoint, token, { method: "GET" });
  return { data: payload.data, meta: payload.meta };
}

export async function adminGetDriverStats(
  token: string,
): Promise<AdminDriverStats> {
  const payload = await authFetch(`/api/v1/admin/drivers/stats`, token, {
    method: "GET",
  });
  return payload.data;
}

export async function adminGetDriverById(
  token: string,
  id: string,
): Promise<Driver> {
  const payload = await authFetch(`/api/v1/admin/drivers/${id}`, token, {
    method: "GET",
  });
  return payload.data;
}

export async function adminCreateDriver(
  token: string,
  payload: CreateDriverPayload,
): Promise<Driver> {
  const data = await authFetch(`/api/v1/admin/drivers`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function adminUpdateDriver(
  token: string,
  id: string,
  payload: UpdateDriverPayload,
): Promise<Driver> {
  const data = await authFetch(`/api/v1/admin/drivers/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function adminDeleteDriver(
  token: string,
  id: string,
): Promise<void> {
  await authFetch(`/api/v1/admin/drivers/${id}`, token, { method: "DELETE" });
}

// ── Driver console ───────────────────────────────────────────────────────────
export async function driverGetMe(token: string): Promise<DriverMe> {
  const payload = await authFetch(`/api/v1/driver/me`, token, { method: "GET" });
  return payload.data;
}

export async function driverGetStats(token: string): Promise<DriverStats> {
  const payload = await authFetch(`/api/v1/driver/stats`, token, {
    method: "GET",
  });
  return payload.data;
}

export async function driverGetAssignments(
  token: string,
  scope?: "active" | "history",
): Promise<Shipment[]> {
  const endpoint = scope
    ? `/api/v1/driver/shipments?scope=${scope}`
    : `/api/v1/driver/shipments`;
  const payload = await authFetch(endpoint, token, { method: "GET" });
  return payload.data;
}

export async function driverGetAssignment(
  token: string,
  id: string,
): Promise<Shipment> {
  const payload = await authFetch(`/api/v1/driver/shipments/${id}`, token, {
    method: "GET",
  });
  return payload.data;
}

export async function driverUpdateStage(
  token: string,
  id: string,
  stage: string,
  note?: string,
): Promise<Shipment> {
  const payload = await authFetch(
    `/api/v1/driver/shipments/${id}/stage`,
    token,
    { method: "PATCH", body: JSON.stringify({ stage, note }) },
  );
  return payload.data;
}

export async function driverCollectCod(
  token: string,
  id: string,
  collected: boolean,
): Promise<Shipment> {
  const payload = await authFetch(`/api/v1/driver/shipments/${id}/cod`, token, {
    method: "PATCH",
    body: JSON.stringify({ collected }),
  });
  return payload.data;
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

  const response = await fetch(
    `${API_BASE_URL}/api/v1/driver/shipments/${id}/proof`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to save proof of delivery");
  }
  return data.data;
}

export async function driverDeleteProof(
  token: string,
  id: string,
): Promise<Shipment> {
  const payload = await authFetch(
    `/api/v1/driver/shipments/${id}/proof`,
    token,
    { method: "DELETE" },
  );
  return payload.data;
}

export async function driverUpdateAvailability(
  token: string,
  availabilityStatus: "available" | "off-duty",
): Promise<Driver> {
  const payload = await authFetch(`/api/v1/driver/availability`, token, {
    method: "PATCH",
    body: JSON.stringify({ availabilityStatus }),
  });
  return payload.data;
}
