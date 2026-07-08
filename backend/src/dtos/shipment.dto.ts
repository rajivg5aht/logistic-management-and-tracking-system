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

// Customers may edit shipment details only while the shipment is pending.
export const CustomerUpdateShipmentDTO = z
  .object({
    pickup: PickupSchema.optional(),
    delivery: DeliverySchema.optional(),
    package: PackageSchema.optional(),
    service: z.enum(["standard", "express", "overnight"]).optional(),
    insurance: z.boolean().optional(),
    specialHandling: z.boolean().optional(),
    amount: z.number().nonnegative("Amount must be a positive number").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one shipment field is required",
  });

export type CustomerUpdateShipmentDTO = z.infer<
  typeof CustomerUpdateShipmentDTO
>;

// DTO used by an admin to update a shipment (status / driver assignment).
export const AdminUpdateShipmentDTO = z.object({
  status: z.enum(SHIPMENT_STATUSES).optional(),
  driverStage: z
    .enum(["picked-up", "in-transit", "out-for-delivery", "delivered"])
    .optional(),
  assignedDriver: z.string().nullable().optional(),
  // Real link to a driver's User account. `null`/"" clears the assignment.
  assignedDriverId: z.string().nullable().optional(),
  // Hubs the parcel routes through. `null`/"" clears the routing.
  originWarehouseId: z.string().nullable().optional(),
  destinationWarehouseId: z.string().nullable().optional(),
  paymentStatus: z.enum(["paid", "pending"]).optional(),
});

export type AdminUpdateShipmentDTO = z.infer<typeof AdminUpdateShipmentDTO>;
