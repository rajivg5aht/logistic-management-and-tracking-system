import { z } from "zod";
import {
  EMPLOYMENT_STATUSES,
  AVAILABILITY_STATUSES,
} from "../types/user.type";
import { DRIVER_STAGES } from "../types/shipment.type";

const PhoneNumberDTO = z
  .string()
  .trim()
  .min(10, "Phone number must be at least 10 digits long");

export const AdminCreateDriverDTO = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: PhoneNumberDTO,
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
  phoneNumber: PhoneNumberDTO.optional(),
  licenseNumber: z.string().min(1, "License number is required").optional(),
  branch: z.string().optional(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type AdminUpdateDriverDTO = z.infer<typeof AdminUpdateDriverDTO>;

export const DriverStageUpdateDTO = z.object({
  stage: z.enum(DRIVER_STAGES),
  note: z.string().optional(),
});

export type DriverStageUpdateDTO = z.infer<typeof DriverStageUpdateDTO>;

export const DriverCodUpdateDTO = z.object({
  collected: z.boolean(),
});

export type DriverCodUpdateDTO = z.infer<typeof DriverCodUpdateDTO>;

export const DriverProofUpdateDTO = z.object({
  notes: z.string().trim().max(500).optional(),
  recipientName: z.string().trim().max(120).optional(),
});

export type DriverProofUpdateDTO = z.infer<typeof DriverProofUpdateDTO>;

export const DriverAvailabilityDTO = z.object({
  availabilityStatus: z.enum(["available", "off-duty"]),
});

export type DriverAvailabilityDTO = z.infer<typeof DriverAvailabilityDTO>;


export const DriverFleetIncidentDTO = z.object({
  category: z.enum(["mechanical", "damage", "tire", "brake", "engine", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  description: z.string().trim().min(10, "Describe the issue in at least 10 characters").max(800),
  location: z.string().trim().max(160).optional().default(""),
});

export type DriverFleetIncidentDTO = z.infer<typeof DriverFleetIncidentDTO>;

export const DriverFuelExpenseDTO = z.object({
  fuelType: z.enum(["petrol", "diesel", "electric", "other"]),
  liters: z.number().min(0).max(500).optional(),
  amount: z.number().min(1, "Fuel amount is required").max(1_000_000),
  odometerKm: z.number().min(0).max(5_000_000),
  stationName: z.string().trim().max(160).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
});

export type DriverFuelExpenseDTO = z.infer<typeof DriverFuelExpenseDTO>;
