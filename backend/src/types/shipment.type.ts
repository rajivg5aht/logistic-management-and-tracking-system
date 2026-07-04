import { z } from "zod";

// Sub-schemas ---------------------------------------------------------------
export const PickupSchema = z.object({
  fullName: z.string().min(1, "Pickup full name is required"),
  phoneNumber: z.string().min(1, "Pickup phone number is required"),
  streetAddress: z.string().min(1, "Pickup address is required"),
  city: z.string().min(1, "Pickup city is required"),
  district: z.string().min(1, "Pickup district is required"),
});

export const DeliverySchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  phoneNumber: z.string().min(1, "Delivery phone number is required"),
  streetAddress: z.string().min(1, "Delivery address is required"),
  city: z.string().min(1, "Delivery city is required"),
  district: z.string().min(1, "Delivery district is required"),
});

export const PackageSchema = z.object({
  parcelType: z.enum(["standard", "fragile", "pallet"]).default("standard"),
  weight: z.string().default(""),
  quantity: z.number().int().positive().default(1),
  dimensions: z
    .object({
      length: z.string().default(""),
      width: z.string().default(""),
      height: z.string().default(""),
    })
    .default({ length: "", width: "", height: "" }),
});

export const SHIPMENT_STATUSES = [
  "pending",
  "in-transit",
  "delivered",
  "cancelled",
] as const;

// Granular delivery step owned by the driver. Layered on top of the canonical
// 4-state status (which the KPIs/chart/customer badges depend on) so it can be
// as detailed as the operational flow needs without rippling through the app.
export const DRIVER_STAGES = [
  "assigned",
  "picked-up",
  "in-transit",
  "out-for-delivery",
  "delivered",
  "failed",
  "returned",
] as const;

export const PAYMENT_METHODS = ["esewa", "khalti", "cod"] as const;

// One entry per stage transition — powers the customer tracking timeline.
export const TimelineEntrySchema = z.object({
  stage: z.enum(DRIVER_STAGES),
  at: z.coerce.date(),
  note: z.string().optional(),
});

// Full shipment schema ------------------------------------------------------
export const ShipmentSchema = z.object({
  pickup: PickupSchema,
  delivery: DeliverySchema,
  package: PackageSchema,
  service: z.enum(["standard", "express", "overnight"]).default("standard"),
  insurance: z.boolean().default(false),
  specialHandling: z.boolean().default(false),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cod"),
  amount: z.number().nonnegative("Amount must be a positive number"),
  status: z.enum(SHIPMENT_STATUSES).default("pending"),
  assignedDriver: z.string().nullable().optional(),
});

export type ShipmentType = z.infer<typeof ShipmentSchema>;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
