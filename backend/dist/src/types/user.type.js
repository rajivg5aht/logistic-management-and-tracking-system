"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.AVAILABILITY_STATUSES = exports.EMPLOYMENT_STATUSES = exports.VEHICLE_TYPES = void 0;
const zod_1 = require("zod");
// Driver-only profile fields. Optional on the base user because they are only
// meaningful when role === "driver"; admins/customers leave them unset.
exports.VEHICLE_TYPES = [
    "bike",
    "scooter",
    "car",
    "van",
    "pickup",
    "truck",
];
exports.EMPLOYMENT_STATUSES = [
    "full-time",
    "part-time",
    "contract",
];
exports.AVAILABILITY_STATUSES = [
    "available",
    "assigned",
    "on-delivery",
    "off-duty",
    "inactive",
];
exports.UserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phoneNumber: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits long"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 character long"),
    profileImage: zod_1.z.string().nullable().optional(),
    role: zod_1.z.enum(["admin", "customer", "driver"]).default("customer"),
    // ── Driver profile (optional) ──
    licenseNumber: zod_1.z.string().optional(),
    vehicleType: zod_1.z.enum(exports.VEHICLE_TYPES).optional(),
    vehicleNumber: zod_1.z.string().optional(),
    branch: zod_1.z.string().optional(),
    employmentStatus: zod_1.z.enum(exports.EMPLOYMENT_STATUSES).optional(),
    availabilityStatus: zod_1.z.enum(exports.AVAILABILITY_STATUSES).optional(),
});
