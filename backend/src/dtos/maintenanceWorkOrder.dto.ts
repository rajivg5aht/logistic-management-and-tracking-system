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

const WorkshopName = z
  .string()
  .trim()
  .min(1, "External workshop is required")
  .max(160);

export const CreateMaintenanceWorkOrderDTO = z.object({
  vendorName: WorkshopName,
  priority: z.enum(MAINTENANCE_WORK_ORDER_PRIORITIES).optional().default("medium"),
  expectedCompletionAt: OptionalDate,
  vehicleOutOfService: z.boolean().optional().default(true),
  adminNote: OptionalText,
});

export type CreateMaintenanceWorkOrderDTO = z.infer<
  typeof CreateMaintenanceWorkOrderDTO
>;

export const AdminUpdateMaintenanceWorkOrderDTO = z.object({
  vendorName: WorkshopName.optional(),
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

export type MaintenanceWorkOrderListStatus =
  (typeof MAINTENANCE_WORK_ORDER_STATUSES)[number];
