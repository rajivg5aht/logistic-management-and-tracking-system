"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverAvailabilityDTO = exports.DriverStageUpdateDTO = exports.AdminUpdateDriverDTO = exports.AdminCreateDriverDTO = void 0;
const zod_1 = require("zod");
const user_type_1 = require("../types/user.type");
const shipment_type_1 = require("../types/shipment.type");
// Admin creates a driver account (internal staff — no public signup).
exports.AdminCreateDriverDTO = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    phoneNumber: zod_1.z.string().min(1, "Phone number is required"),
    licenseNumber: zod_1.z.string().min(1, "License number is required"),
    branch: zod_1.z.string().optional().default(""),
    employmentStatus: zod_1.z.enum(user_type_1.EMPLOYMENT_STATUSES).optional().default("full-time"),
    availabilityStatus: zod_1.z.enum(user_type_1.AVAILABILITY_STATUSES).optional().default("available"),
});
exports.AdminUpdateDriverDTO = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required").optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long").optional(),
    phoneNumber: zod_1.z.string().optional(),
    licenseNumber: zod_1.z.string().min(1, "License number is required").optional(),
    branch: zod_1.z.string().optional(),
    employmentStatus: zod_1.z.enum(user_type_1.EMPLOYMENT_STATUSES).optional(),
    availabilityStatus: zod_1.z.enum(user_type_1.AVAILABILITY_STATUSES).optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
// A driver updates the delivery stage of one of their assigned shipments.
exports.DriverStageUpdateDTO = zod_1.z.object({
    stage: zod_1.z.enum(shipment_type_1.DRIVER_STAGES),
    note: zod_1.z.string().optional(),
});
// A driver toggles their own availability (available / off-duty).
exports.DriverAvailabilityDTO = zod_1.z.object({
    availabilityStatus: zod_1.z.enum(["available", "off-duty"]),
});
