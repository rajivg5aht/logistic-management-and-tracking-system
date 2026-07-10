import { z } from "zod";

export const AdminSettleCodDTO = z.object({
  notes: z.string().trim().max(500).optional().default(""),
});

export type AdminSettleCodDTO = z.infer<typeof AdminSettleCodDTO>;

export const AdminRefundDTO = z.object({
  shipmentId: z.string().min(1, "Shipment id is required"),
  amount: z.number().min(1, "Refund amount must be greater than zero").optional(),
  reason: z.string().trim().max(500).optional().default(""),
});

export type AdminRefundDTO = z.infer<typeof AdminRefundDTO>;
