import { z } from "zod";
import {
  PickupSchema,
  DeliverySchema,
  PackageSchema,
  SHIPMENT_STATUSES,
  PAYMENT_METHODS,
} from "../types/shipment.type";

// DTO used by a customer when confirming & paying for a shipment.
export const CreateShipmentDTO = z.object({
  pickup: PickupSchema,
  delivery: DeliverySchema,
  package: PackageSchema,
  service: z.enum(["standard", "express", "overnight"]).default("standard"),
  insurance: z.boolean().default(false),
  specialHandling: z.boolean().default(false),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cod"),
  amount: z.number().nonnegative("Amount must be a positive number"),
});

export type CreateShipmentDTO = z.infer<typeof CreateShipmentDTO>;

// DTO used by an admin to update a shipment (status / driver assignment).
export const AdminUpdateShipmentDTO = z.object({
  status: z.enum(SHIPMENT_STATUSES).optional(),
  assignedDriver: z.string().nullable().optional(),
  paymentStatus: z.enum(["paid", "pending"]).optional(),
});

export type AdminUpdateShipmentDTO = z.infer<typeof AdminUpdateShipmentDTO>;
