import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

export const INCIDENT_STATUSES = [
  "open",
  "reviewing",
  "monitoring",
  "maintenance_required",
  "assigned_to_maintenance",
  "in_repair",
  "awaiting_verification",
  "closed",
  "resolved",
  "rejected",
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

export const MAINTENANCE_WORK_ORDER_STATUSES = [
  "assigned",
  "in_repair",
  "awaiting_verification",
  "closed",
  "cancelled",
] as const;
export type MaintenanceWorkOrderStatus =
  (typeof MAINTENANCE_WORK_ORDER_STATUSES)[number];

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
  adminNote: string;
  resolutionNote: string;
  rejectionReason: string;
  maintenanceAction: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceWorkOrder = {
  id: string;
  incidentId: string;
  incidentCategory: string;
  incidentDescription: string;
  incidentLocation: string;
  vehicleId: string;
  vehicleRegistration: string | null;
  driverId: string;
  driverName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  vendorName: string;
  priority: "low" | "medium" | "high" | "critical" | string;
  expectedCompletionAt: string | null;
  vehicleOutOfService: boolean;
  status: MaintenanceWorkOrderStatus | string;
  adminNote: string;
  diagnosis: string;
  repairNotes: string;
  partsUsed: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  invoiceUrl: string;
  repairStartedAt: string | null;
  repairCompletedAt: string | null;
  verifiedAt: string | null;
  closedAt: string | null;
  cancellationReason: string;
  events: Array<{
    fromStatus: string | null;
    toStatus: string;
    actorId: string;
    actorName: string | null;
    actorRole: "admin";
    note: string;
    createdAt: string;
  }>;
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
  openIncidents: number;
  pendingFuelExpenses: number;
  approvedFuelExpenses: number;
};

export type AdminIncidentUpdatePayload = {
  status?: IncidentStatus;
  adminNote?: string;
  resolutionNote?: string;
  rejectionReason?: string;
  maintenanceAction?: string;
};

export type AdminFuelExpenseUpdatePayload = {
  status?: FuelExpenseStatus;
  adminNote?: string;
  rejectionReason?: string;
  paymentReference?: string;
};

export type CreateMaintenanceWorkOrderPayload = {
  vendorName?: string;
  priority?: "low" | "medium" | "high" | "critical";
  expectedCompletionAt?: string;
  vehicleOutOfService?: boolean;
  adminNote?: string;
};

export type AdminMaintenanceWorkOrderUpdatePayload = {
  vendorName?: string;
  priority?: "low" | "medium" | "high" | "critical";
  expectedCompletionAt?: string;
  vehicleOutOfService?: boolean;
  adminNote?: string;
  status?: "closed" | "cancelled";
  verificationNote?: string;
  cancellationReason?: string;
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

export async function adminGetWorkOrders(
  token: string,
  { status = "", page = 1, limit = 20 }: ListParams = {},
): Promise<{ data: MaintenanceWorkOrder[]; meta: FleetReportsMeta }> {
  return authenticatedRequestWithMeta<MaintenanceWorkOrder[], FleetReportsMeta>(
    "/api/v1/admin/fleet-reports/work-orders" +
      buildQueryString({ status, page, limit }),
    token,
    { method: "GET" },
  );
}

export async function adminCreateWorkOrder(
  token: string,
  incidentId: string,
  payload: CreateMaintenanceWorkOrderPayload,
): Promise<MaintenanceWorkOrder> {
  return authenticatedRequest<MaintenanceWorkOrder>(
    "/api/v1/admin/fleet-reports/incidents/" + incidentId + "/work-orders",
    token,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function adminUpdateWorkOrder(
  token: string,
  id: string,
  payload: AdminMaintenanceWorkOrderUpdatePayload,
): Promise<MaintenanceWorkOrder> {
  return authenticatedRequest<MaintenanceWorkOrder>(
    "/api/v1/admin/fleet-reports/work-orders/" + id,
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