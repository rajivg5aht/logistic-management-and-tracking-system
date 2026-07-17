import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

export const INCIDENT_STATUSES = [
  "pending_review",
  "resolved",
  "maintenance_required",
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const FUEL_EXPENSE_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "reimbursed",
] as const;
export type FuelExpenseStatus = (typeof FUEL_EXPENSE_STATUSES)[number];

export type AdminIncident = {
  id: string;
  vehicleId: string;
  vehicleRegistration: string | null;
  driverId: string;
  driverName: string | null;
  category: string;
  severity: string;
  description: string;
  location: string;
  status: IncidentStatus;
  adminNote: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminFuelExpense = {
  id: string;
  vehicleId: string;
  vehicleRegistration: string | null;
  driverId: string;
  driverName: string | null;
  fuelType: string;
  liters?: number;
  amount: number;
  odometerKm: number;
  stationName: string;
  notes: string;
  receiptUrl: string;
  status: FuelExpenseStatus | string;
  adminNote: string;
  rejectionReason: string;
  approvedBy: string | null;
  approvedAt: string | null;
  reimbursedBy: string | null;
  reimbursedAt: string | null;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
};

export type FleetReportsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type FleetReportStats = {
  pendingIncidents: number;
  pendingFuelExpenses: number;
  approvedFuelExpenses: number;
};

export type AdminIncidentUpdatePayload = {
  decision: "normal" | "maintenance_required";
  adminNote?: string;
};

export type AdminFuelExpenseUpdatePayload = {
  status?: FuelExpenseStatus;
  adminNote?: string;
  rejectionReason?: string;
  paymentReference?: string;
};

type ListParams = {
  status?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
};

export async function adminGetIncidents(
  token: string,
  { status = "", vehicleId = "", page = 1, limit = 20 }: ListParams = {},
): Promise<{ data: AdminIncident[]; meta: FleetReportsMeta }> {
  return authenticatedRequestWithMeta<AdminIncident[], FleetReportsMeta>(
    "/api/v1/admin/fleet-reports/incidents" +
      buildQueryString({ status, vehicleId, page, limit }),
    token,
    { method: "GET" },
  );
}

export async function adminUpdateIncident(
  token: string,
  id: string,
  payload: AdminIncidentUpdatePayload,
): Promise<AdminIncident> {
  return authenticatedRequest<AdminIncident>(
    "/api/v1/admin/fleet-reports/incidents/" + id,
    token,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function adminGetFuelExpenses(
  token: string,
  { status = "", vehicleId = "", page = 1, limit = 20 }: ListParams = {},
): Promise<{ data: AdminFuelExpense[]; meta: FleetReportsMeta }> {
  return authenticatedRequestWithMeta<AdminFuelExpense[], FleetReportsMeta>(
    "/api/v1/admin/fleet-reports/fuel-expenses" +
      buildQueryString({ status, vehicleId, page, limit }),
    token,
    { method: "GET" },
  );
}

export async function adminUpdateFuelExpense(
  token: string,
  id: string,
  payload: AdminFuelExpenseUpdatePayload,
): Promise<AdminFuelExpense> {
  return authenticatedRequest<AdminFuelExpense>(
    "/api/v1/admin/fleet-reports/fuel-expenses/" + id,
    token,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function adminGetFleetReportStats(
  token: string,
): Promise<FleetReportStats> {
  return authenticatedRequest<FleetReportStats>(
    "/api/v1/admin/fleet-reports/stats",
    token,
    { method: "GET" },
  );
}
