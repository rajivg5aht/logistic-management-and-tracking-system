import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

export const INCIDENT_STATUSES = ["open", "reviewing", "resolved"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const FUEL_EXPENSE_STATUSES = [
  "submitted",
  "approved",
  "rejected",
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
  status: IncidentStatus | string;
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
  status: FuelExpenseStatus | string;
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
  openIncidents: number;
  pendingFuelExpenses: number;
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
    `/api/v1/admin/fleet-reports/incidents${buildQueryString({
      status,
      vehicleId,
      page,
      limit,
    })}`,
    token,
    { method: "GET" },
  );
}

export async function adminUpdateIncidentStatus(
  token: string,
  id: string,
  status: IncidentStatus,
): Promise<AdminIncident> {
  return authenticatedRequest<AdminIncident>(
    `/api/v1/admin/fleet-reports/incidents/${id}`,
    token,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
}

export async function adminGetFuelExpenses(
  token: string,
  { status = "", vehicleId = "", page = 1, limit = 20 }: ListParams = {},
): Promise<{ data: AdminFuelExpense[]; meta: FleetReportsMeta }> {
  return authenticatedRequestWithMeta<AdminFuelExpense[], FleetReportsMeta>(
    `/api/v1/admin/fleet-reports/fuel-expenses${buildQueryString({
      status,
      vehicleId,
      page,
      limit,
    })}`,
    token,
    { method: "GET" },
  );
}

export async function adminUpdateFuelExpenseStatus(
  token: string,
  id: string,
  status: FuelExpenseStatus,
): Promise<AdminFuelExpense> {
  return authenticatedRequest<AdminFuelExpense>(
    `/api/v1/admin/fleet-reports/fuel-expenses/${id}`,
    token,
    { method: "PATCH", body: JSON.stringify({ status }) },
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
