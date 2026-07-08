const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ShipmentStatus = "pending" | "in-transit" | "delivered" | "cancelled";
export type PaymentMethod = "esewa" | "khalti" | "cod";
export type ServiceType = "standard" | "express" | "overnight";

export type DriverStage =
  | "assigned"
  | "picked-up"
  | "in-transit"
  | "out-for-delivery"
  | "delivered"
  | "failed"
  | "returned";

export const DRIVER_STAGE_LABELS: Record<DriverStage, string> = {
  assigned: "Assigned",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  failed: "Delivery Failed",
  returned: "Returned",
};

// Keep grouped database statuses for filters/statistics, but show users the
// exact operational phase currently reported by the driver.
export function getShipmentDisplayStatus(shipment: {
  status: ShipmentStatus;
  driverStage: DriverStage | null;
}): string {
  if (shipment.driverStage) {
    if (shipment.driverStage === "assigned") return "Pending";
    return DRIVER_STAGE_LABELS[shipment.driverStage];
  }

  const labels: Record<ShipmentStatus, string> = {
    pending: "Pending",
    "in-transit": "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[shipment.status];
}

export type TimelineEntry = {
  stage: DriverStage;
  at: string;
  note?: string;
};

export type ProofOfDelivery = {
  photoUrl: string | null;
  notes: string;
  recipientName: string;
  confirmedAt: string | null;
  confirmedByDriverId: string | null;
  updatedAt: string | null;
};

export type ShipmentAddress = {
  fullName?: string;
  recipientName?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  district?: string;
};

export type ShipmentPackage = {
  parcelType: "standard" | "fragile" | "pallet";
  weight: string;
  quantity: number;
  dimensions: { length: string; width: string; height: string };
};

// Latest live driver position mirrored onto the shipment (null until the
// assigned driver starts live tracking).
export type CurrentLocation = {
  latitude: number;
  longitude: number;
  updatedAt: string;
};

export type Shipment = {
  id: string;
  trackingId: string;
  customer: string;
  pickup: ShipmentAddress;
  delivery: ShipmentAddress;
  package: ShipmentPackage;
  service: ServiceType;
  insurance: boolean;
  specialHandling: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: "paid" | "pending";
  deliveredAt: string | null;
  proofOfDelivery: ProofOfDelivery | null;
  amount: number;
  status: ShipmentStatus;
  assignedDriver: string | null;
  assignedDriverId: string | null;
  assignedVehicle: string | null;
  assignedVehicleId: string | null;
  driverStage: DriverStage | null;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ShipmentMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type DailyVolume = {
  date: string; // YYYY-MM-DD in Nepal local time
  label: string; // Weekday abbreviation, e.g. "Mon"
  count: number; // Shipments created that day
};

export type ShipmentStats = {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  deliveredToday: number;
  pendingCodAmount: number;
  dailyVolume: DailyVolume[]; // Last 7 days, oldest → today
};

export type CreateShipmentPayload = {
  pickup: ShipmentAddress;
  delivery: ShipmentAddress;
  package: ShipmentPackage;
  service: ServiceType;
  insurance: boolean;
  specialHandling: boolean;
  paymentMethod: PaymentMethod;
  amount: number;
};

export type CustomerUpdateShipmentPayload = {
  pickup?: ShipmentAddress;
  delivery?: ShipmentAddress;
  package?: ShipmentPackage;
  service?: ServiceType;
  insurance?: boolean;
  specialHandling?: boolean;
  amount?: number;
};

export type AdminUpdateShipmentPayload = {
  status?: ShipmentStatus;
  driverStage?:
    | "picked-up"
    | "in-transit"
    | "out-for-delivery"
    | "delivered";
  assignedDriver?: string | null;
  assignedDriverId?: string | null;
  paymentStatus?: "paid" | "pending";
};

// ── Customer ────────────────────────────────────────────────────────────────
export async function createShipment(
  token: string,
  payload: CreateShipmentPayload,
): Promise<Shipment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipments`, {
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
    throw new Error(data.message || "Failed to create shipment");
  }

  return data.data;
}

export async function getMyShipments(token: string): Promise<Shipment[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipments/my`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to load shipments");
  }

  return data.data;
}

export async function updateMyShipment(
  token: string,
  id: string,
  payload: CustomerUpdateShipmentPayload,
): Promise<Shipment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipments/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to update shipment");
  }

  return data.data;
}

export async function cancelMyShipment(
  token: string,
  id: string,
): Promise<Shipment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipments/${id}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to cancel shipment");
  }

  return data.data;
}

export async function deleteMyShipment(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to delete shipment");
  }
}

// Clears the customer's completed history (delivered + cancelled). Active
// shipments are retained server-side. Returns how many were removed.
export async function deleteMyShipmentHistory(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipments/history`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to delete shipment history");
  }
  return data.data?.deletedCount ?? 0;
}

// ── Admin ────────────────────────────────────────────────────────────────────
export async function adminGetShipments(
  token: string,
  page: number,
  limit: number,
  search?: string,
  status?: ShipmentStatus,
): Promise<{ data: Shipment[]; meta: ShipmentMeta }> {
  let endpoint = `${API_BASE_URL}/api/v1/admin/shipments?page=${page}&limit=${limit}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  if (status) endpoint += `&status=${status}`;

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
    throw new Error(payload.message || "Failed to fetch shipments");
  }

  return { data: payload.data, meta: payload.meta };
}

export async function adminGetShipmentStats(
  token: string,
): Promise<ShipmentStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/shipments/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || "Failed to fetch shipment stats");
  }

  return payload.data;
}

export async function adminUpdateShipment(
  token: string,
  id: string,
  payload: AdminUpdateShipmentPayload,
): Promise<Shipment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/shipments/${id}`, {
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
    throw new Error(data.message || "Failed to update shipment");
  }

  return data.data;
}

export async function adminDeleteShipment(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/shipments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to delete shipment");
  }
}
