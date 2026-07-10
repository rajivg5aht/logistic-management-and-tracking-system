import {
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

export const PAYMENT_METHODS = ["esewa", "khalti", "cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_TYPES = ["charge", "refund"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "collected",
  "settled",
  "refunded",
  "failed",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type Payment = {
  id: string;
  shipmentId: string;
  trackingId: string | null;
  customerId: string;
  customerName: string | null;
  type: PaymentType | string;
  method: PaymentMethod | string;
  amount: number;
  status: PaymentStatus | string;
  reference: string;
  collectedByDriverId: string | null;
  collectedAt: string | null;
  settledByAdminId: string | null;
  settledAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentStats = {
  revenue: number;
  outstandingCod: number;
  codHeldByDrivers: number;
  refunds: number;
};

export type PaymentsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AdminListParams = {
  status?: string;
  method?: string;
  type?: string;
  page?: number;
  limit?: number;
};

export async function getMyPayments(token: string): Promise<Payment[]> {
  return authenticatedRequest<Payment[]>("/api/v1/payments/mine", token, {
    method: "GET",
  });
}

export async function adminGetPayments(
  token: string,
  { status = "", method = "", type = "", page = 1, limit = 20 }: AdminListParams = {},
): Promise<{ data: Payment[]; meta: PaymentsMeta }> {
  return authenticatedRequestWithMeta<Payment[], PaymentsMeta>(
    `/api/v1/admin/payments${buildQueryString({
      status,
      method,
      type,
      page,
      limit,
    })}`,
    token,
    { method: "GET" },
  );
}

export async function adminGetPaymentStats(
  token: string,
): Promise<PaymentStats> {
  return authenticatedRequest<PaymentStats>(
    "/api/v1/admin/payments/stats",
    token,
    { method: "GET" },
  );
}

export async function adminSettleCod(
  token: string,
  id: string,
): Promise<Payment> {
  return authenticatedRequest<Payment>(
    `/api/v1/admin/payments/${id}/settle`,
    token,
    { method: "PATCH", body: JSON.stringify({}) },
  );
}

export async function adminRefundPayment(
  token: string,
  payload: { shipmentId: string; amount?: number; reason?: string },
): Promise<Payment> {
  return authenticatedRequest<Payment>("/api/v1/admin/payments/refund", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
