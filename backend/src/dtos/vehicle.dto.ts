import { z } from "zod";
import { VEHICLE_TYPES } from "../types/user.type";
import { VEHICLE_STATUSES } from "../models/vehicle.model";

const OptionalDate = z
  .union([z.string().date(), z.literal(""), z.null()])
  .optional();

export const AdminCreateVehicleDTO = z.object({
  registrationNumber: z.string().trim().min(1, "Registration number is required"),
  type: z.enum(VEHICLE_TYPES),
  make: z.string().trim().optional().default(""),
  model: z.string().trim().optional().default(""),
  year: z.number().int().min(1900).max(2200).optional(),
  capacityKg: z.number().positive().optional(),
  branch: z.string().trim().optional().default(""),
  warehouseId: z.string().nullable().optional(),
  status: z.enum(VEHICLE_STATUSES).optional().default("available"),
  insuranceExpiry: OptionalDate,
  registrationExpiry: OptionalDate,
  lastServiceAt: OptionalDate,
  nextServiceAt: OptionalDate,
  odometerKm: z.number().nonnegative().optional().default(0),
});

export type AdminCreateVehicleDTO = z.infer<typeof AdminCreateVehicleDTO>;

export const AdminUpdateVehicleDTO = AdminCreateVehicleDTO.partial().omit({
  registrationNumber: true,
});

export type AdminUpdateVehicleDTO = z.infer<typeof AdminUpdateVehicleDTO>;

export const AdminAssignVehicleDTO = z.object({
  driverId: z.string().nullable(),
});

export type AdminAssignVehicleDTO = z.infer<typeof AdminAssignVehicleDTO>;
