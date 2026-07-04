import { z } from "zod";

// Driver-only profile fields. Optional on the base user because they are only
// meaningful when role === "driver"; admins/customers leave them unset.
export const VEHICLE_TYPES = [
  "bike",
  "scooter",
  "car",
  "van",
  "pickup",
  "truck",
] as const;

export const EMPLOYMENT_STATUSES = [
  "full-time",
  "part-time",
  "contract",
] as const;

export const AVAILABILITY_STATUSES = [
  "available",
  "assigned",
  "on-delivery",
  "off-duty",
  "inactive",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const UserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),

  email: z.string().email("Invalid email address"),

  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits long"),

  password: z
    .string()
    .min(6, "Password must be at least 6 character long"),

  profileImage: z.string().nullable().optional(),

  role: z.enum(["admin", "customer", "driver"]).default("customer"),

  // ── Driver profile (optional) ──
  licenseNumber: z.string().optional(),
  vehicleType: z.enum(VEHICLE_TYPES).optional(),
  vehicleNumber: z.string().optional(),
  branch: z.string().optional(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
});

export type UserType = z.infer<typeof UserSchema>;