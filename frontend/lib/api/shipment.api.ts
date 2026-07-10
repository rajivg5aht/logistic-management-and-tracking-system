import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

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
  currentLocation: CurrentLocation | null;
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
  date: string;
  label: string;
  count: number;
};

export type ShipmentStats = {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  deliveredToday: number;
  pendingCodAmount: number;
  dailyVolume: DailyVolume[];
};

export type MonthlyRevenue = {
  label: string;
  revenue: number;
};

export type RegionVolume = {
  region: string;
  count: number;
};

export type ShipmentAnalytics = {
  totalRevenue: number;
  revenueDelta: number;
  deliveries: number;
  deliveriesDelta: number;
  avgDeliveryMs: number | null;
  avgTimeDelta: number;
  successRate: number;
  successDelta: number;
  monthlyRevenue: MonthlyRevenue[];
  regionVolume: RegionVolume[];
  totalShipments: number;
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

export async function createShipment(
  token: string,
  payload: CreateShipmentPayload,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>("/api/v1/shipments", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyShipments(token: string): Promise<Shipment[]> {
  return authenticatedRequest<Shipment[]>("/api/v1/shipments/my", token, {
    method: "GET",
  });
}

export async function updateMyShipment(
  token: string,
  id: string,
  payload: CustomerUpdateShipmentPayload,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>(`/api/v1/shipments/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function cancelMyShipment(
  token: string,
  id: string,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>(
    `/api/v1/shipments/${id}/cancel`,
    token,
    { method: "PATCH" },
  );
}

export async function deleteMyShipment(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(`/api/v1/shipments/${id}`, token, {
    method: "DELETE",
  });
}

export async function deleteMyShipmentHistory(token: string): Promise<number> {
  const result = await authenticatedRequest<{ deletedCount?: number }>(
    "/api/v1/shipments/history",
    token,
    { method: "DELETE" },
  );
  return result.deletedCount ?? 0;
}

export async function adminGetShipments(
  token: string,
  page: number,
  limit: number,
  search?: string,
  status?: ShipmentStatus,
): Promise<{ data: Shipment[]; meta: ShipmentMeta }> {
  return authenticatedRequestWithMeta<Shipment[], ShipmentMeta>(
    `/api/v1/admin/shipments${buildQueryString({
      page,
      limit,
      search,
      status,
    })}`,
    token,
    { method: "GET" },
  );
}

export async function adminGetShipmentStats(
  token: string,
): Promise<ShipmentStats> {
  return authenticatedRequest<ShipmentStats>(
    "/api/v1/admin/shipments/stats",
    token,
    { method: "GET" },
  );
}

export async function adminGetAnalytics(
  token: string,
): Promise<ShipmentAnalytics> {
  return authenticatedRequest<ShipmentAnalytics>(
    "/api/v1/admin/shipments/analytics",
    token,
    { method: "GET" },
  );
}

export async function adminUpdateShipment(
  token: string,
  id: string,
  payload: AdminUpdateShipmentPayload,
): Promise<Shipment> {
  return authenticatedRequest<Shipment>(
    `/api/v1/admin/shipments/${id}`,
    token,
    { method: "PUT", body: JSON.stringify(payload) },
  );
}

export async function adminDeleteShipment(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(`/api/v1/admin/shipments/${id}`, token, {
    method: "DELETE",
  });
}
