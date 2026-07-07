import { z } from "zod";
import {
  EMPLOYMENT_STATUSES,
  AVAILABILITY_STATUSES,
} from "../types/user.type";
import { DRIVER_STAGES } from "../types/shipment.type";

// Admin creates a driver account (internal staff — no public signup).
export const AdminCreateDriverDTO = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  branch: z.string().optional().default(""),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).optional().default("full-time"),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional().default("available"),
});

export type AdminCreateDriverDTO = z.infer<typeof AdminCreateDriverDTO>;

export const AdminUpdateDriverDTO = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  phoneNumber: z.string().optional(),
  licenseNumber: z.string().min(1, "License number is required").optional(),
  branch: z.string().optional(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type AdminUpdateDriverDTO = z.infer<typeof AdminUpdateDriverDTO>;

// A driver updates the delivery stage of one of their assigned shipments.
export const DriverStageUpdateDTO = z.object({
  stage: z.enum(DRIVER_STAGES),
  note: z.string().optional(),
});

export type DriverStageUpdateDTO = z.infer<typeof DriverStageUpdateDTO>;

// A driver records whether they collected the COD cash for a shipment. Boolean
// so an accidental tap can be undone (paid -> pending).
export const DriverCodUpdateDTO = z.object({
  collected: z.boolean(),
});

export type DriverCodUpdateDTO = z.infer<typeof DriverCodUpdateDTO>;

// A driver toggles their own availability (available / off-duty).
export const DriverAvailabilityDTO = z.object({
  availabilityStatus: z.enum(["available", "off-duty"]),
});

export type DriverAvailabilityDTO = z.infer<typeof DriverAvailabilityDTO>;
