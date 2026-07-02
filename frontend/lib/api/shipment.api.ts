const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ShipmentStatus = "pending" | "in-transit" | "delivered" | "cancelled";
export type PaymentMethod = "esewa" | "khalti" | "cod";
export type ServiceType = "standard" | "express" | "overnight";

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
  amount: number;
  status: ShipmentStatus;
  assignedDriver: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShipmentMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ShipmentStats = {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
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

export type AdminUpdateShipmentPayload = {
  status?: ShipmentStatus;
  assignedDriver?: string | null;
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
