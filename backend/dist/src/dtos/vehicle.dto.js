"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAssignVehicleDTO = exports.AdminUpdateVehicleDTO = exports.AdminCreateVehicleDTO = void 0;
const zod_1 = require("zod");
const user_type_1 = require("../types/user.type");
const vehicle_model_1 = require("../models/vehicle.model");
const OptionalDate = zod_1.z
    .union([zod_1.z.string().date(), zod_1.z.literal(""), zod_1.z.null()])
    .optional();
exports.AdminCreateVehicleDTO = zod_1.z.object({
    registrationNumber: zod_1.z.string().trim().min(1, "Registration number is required"),
    type: zod_1.z.enum(user_type_1.VEHICLE_TYPES),
    make: zod_1.z.string().trim().optional().default(""),
    model: zod_1.z.string().trim().optional().default(""),
    year: zod_1.z.number().int().min(1900).max(2200).optional(),
    capacityKg: zod_1.z.number().positive().optional(),
    branch: zod_1.z.string().trim().optional().default(""),
    status: zod_1.z.enum(vehicle_model_1.VEHICLE_STATUSES).optional().default("available"),
    insuranceExpiry: OptionalDate,
    registrationExpiry: OptionalDate,
    lastServiceAt: OptionalDate,
    nextServiceAt: OptionalDate,
    odometerKm: zod_1.z.number().nonnegative().optional().default(0),
});
exports.AdminUpdateVehicleDTO = exports.AdminCreateVehicleDTO.partial().omit({
    registrationNumber: true,
});
exports.AdminAssignVehicleDTO = zod_1.z.object({
    driverId: zod_1.z.string().nullable(),
});
