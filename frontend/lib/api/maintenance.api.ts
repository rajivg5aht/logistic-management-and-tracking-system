import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";
import type {
  FleetReportsMeta,
  MaintenanceWorkOrder,
  MaintenanceWorkOrderStatus,
} from "@/lib/api/fleetReports.api";

export type MaintenanceWorkOrderUpdatePayload = {
  status?: Extract<
    MaintenanceWorkOrderStatus,
    "in_repair" | "awaiting_verification"
  >;
  diagnosis?: string;
  repairNotes?: string;
  partsUsed?: string;
  partsCost?: number;
  laborCost?: number;
  invoice?: File | null;
  activityNote?: string;
};

function workOrderBody(
  payload: MaintenanceWorkOrderUpdatePayload,
): BodyInit {
  if (!payload.invoice) {
    const { invoice: _invoice, ...jsonPayload } = payload;
    return JSON.stringify(jsonPayload);
  }

  const formData = new FormData();
  if (payload.status) formData.append("status", payload.status);
  if (payload.diagnosis !== undefined) formData.append("diagnosis", payload.diagnosis);
  if (payload.repairNotes !== undefined) formData.append("repairNotes", payload.repairNotes);
  if (payload.partsUsed !== undefined) formData.append("partsUsed", payload.partsUsed);
  if (payload.partsCost !== undefined) formData.append("partsCost", String(payload.partsCost));
  if (payload.laborCost !== undefined) formData.append("laborCost", String(payload.laborCost));
  if (payload.activityNote !== undefined) formData.append("activityNote", payload.activityNote);
  formData.append("invoice", payload.invoice);
  return formData;
}

export async function maintenanceGetWorkOrders(
  token: string,
  {
    status = "",
    page = 1,
    limit = 30,
  }: { status?: string; page?: number; limit?: number } = {},
): Promise<{ data: MaintenanceWorkOrder[]; meta: FleetReportsMeta }> {
  return authenticatedRequestWithMeta<MaintenanceWorkOrder[], FleetReportsMeta>(
    "/api/v1/maintenance/work-orders" +
      buildQueryString({ status, page, limit }),
    token,
    { method: "GET" },
  );
}

export async function maintenanceUpdateWorkOrder(
  token: string,
  id: string,
  payload: MaintenanceWorkOrderUpdatePayload,
): Promise<MaintenanceWorkOrder> {
  return authenticatedRequest<MaintenanceWorkOrder>(
    "/api/v1/maintenance/work-orders/" + id,
    token,
    { method: "PATCH", body: workOrderBody(payload) },
  );
}