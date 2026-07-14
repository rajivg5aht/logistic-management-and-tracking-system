import { z } from "zod";
import {
  MAINTENANCE_WORK_ORDER_PRIORITIES,
  MAINTENANCE_WORK_ORDER_STATUSES,
} from "../models/maintenanceWorkOrder.model";

const OptionalText = z.string().trim().max(1500).optional();
const OptionalDate = z
  .string()
  .trim()
  .max(80)
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    message: "Expected completion date is invalid",
  })
  .optional();

export const CreateMaintenanceWorkOrderDTO = z
  .object({
    maintenanceUserId: z.string().trim().length(24).nullable().optional(),
    vendorName: z.string().trim().max(160).optional(),
    priority: z.enum(MAINTENANCE_WORK_ORDER_PRIORITIES).optional().default("medium"),
    expectedCompletionAt: OptionalDate,
    vehicleOutOfService: z.boolean().optional().default(true),
    adminNote: OptionalText,
  })
  .superRefine((value, ctx) => {
    if (!value.maintenanceUserId && !value.vendorName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["maintenanceUserId"],
        message: "Assign a maintenance user or specify an external workshop",
      });
    }
  });

export type CreateMaintenanceWorkOrderDTO = z.infer<
  typeof CreateMaintenanceWorkOrderDTO
>;

export const AdminUpdateMaintenanceWorkOrderDTO = z.object({
  maintenanceUserId: z.string().trim().length(24).nullable().optional(),
  vendorName: z.string().trim().max(160).optional(),
  priority: z.enum(MAINTENANCE_WORK_ORDER_PRIORITIES).optional(),
  expectedCompletionAt: OptionalDate,
  vehicleOutOfService: z.boolean().optional(),
  adminNote: OptionalText,
  status: z.enum(["closed", "cancelled"]).optional(),
  verificationNote: OptionalText,
  cancellationReason: OptionalText,
});

export type AdminUpdateMaintenanceWorkOrderDTO = z.infer<
  typeof AdminUpdateMaintenanceWorkOrderDTO
>;

export const MaintenanceWorkOrderUpdateDTO = z.object({
  status: z.enum(["in_repair", "awaiting_verification"]).optional(),
  diagnosis: OptionalText,
  repairNotes: OptionalText,
  partsUsed: OptionalText,
  partsCost: z.coerce.number().min(0).max(100000000).optional(),
  laborCost: z.coerce.number().min(0).max(100000000).optional(),
  invoiceUrl: z.string().trim().max(500).optional(),
  activityNote: OptionalText,
});

export type MaintenanceWorkOrderUpdateDTO = z.infer<
  typeof MaintenanceWorkOrderUpdateDTO
>;

export type MaintenanceWorkOrderListStatus =
  (typeof MAINTENANCE_WORK_ORDER_STATUSES)[number];