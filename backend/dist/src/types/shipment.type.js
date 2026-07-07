"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentSchema = exports.TimelineEntrySchema = exports.PAYMENT_METHODS = exports.DRIVER_STAGES = exports.SHIPMENT_STATUSES = exports.PackageSchema = exports.DeliverySchema = exports.PickupSchema = void 0;
const zod_1 = require("zod");
// Sub-schemas ---------------------------------------------------------------
exports.PickupSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Pickup full name is required"),
    phoneNumber: zod_1.z.string().min(1, "Pickup phone number is required"),
    streetAddress: zod_1.z.string().min(1, "Pickup address is required"),
    city: zod_1.z.string().min(1, "Pickup city is required"),
    district: zod_1.z.string().min(1, "Pickup district is required"),
});
exports.DeliverySchema = zod_1.z.object({
    recipientName: zod_1.z.string().min(1, "Recipient name is required"),
    phoneNumber: zod_1.z.string().min(1, "Delivery phone number is required"),
    streetAddress: zod_1.z.string().min(1, "Delivery address is required"),
    city: zod_1.z.string().min(1, "Delivery city is required"),
    district: zod_1.z.string().min(1, "Delivery district is required"),
});
exports.PackageSchema = zod_1.z.object({
    parcelType: zod_1.z.enum(["standard", "fragile", "pallet"]).default("standard"),
    weight: zod_1.z.string().default(""),
    quantity: zod_1.z.number().int().positive().default(1),
    dimensions: zod_1.z
        .object({
        length: zod_1.z.string().default(""),
        width: zod_1.z.string().default(""),
        height: zod_1.z.string().default(""),
    })
        .default({ length: "", width: "", height: "" }),
});
exports.SHIPMENT_STATUSES = [
    "pending",
    "in-transit",
    "delivered",
    "cancelled",
];
// Granular delivery step owned by the driver. Layered on top of the canonical
// 4-state status (which the KPIs/chart/customer badges depend on) so it can be
// as detailed as the operational flow needs without rippling through the app.
exports.DRIVER_STAGES = [
    "assigned",
    "picked-up",
    "in-transit",
    "out-for-delivery",
    "delivered",
    "failed",
    "returned",
];
exports.PAYMENT_METHODS = ["esewa", "khalti", "cod"];
// One entry per stage transition — powers the customer tracking timeline.
exports.TimelineEntrySchema = zod_1.z.object({
    stage: zod_1.z.enum(exports.DRIVER_STAGES),
    at: zod_1.z.coerce.date(),
    note: zod_1.z.string().optional(),
});
// Full shipment schema ------------------------------------------------------
exports.ShipmentSchema = zod_1.z.object({
    pickup: exports.PickupSchema,
    delivery: exports.DeliverySchema,
    package: exports.PackageSchema,
    service: zod_1.z.enum(["standard", "express", "overnight"]).default("standard"),
    insurance: zod_1.z.boolean().default(false),
    specialHandling: zod_1.z.boolean().default(false),
    paymentMethod: zod_1.z.enum(exports.PAYMENT_METHODS).default("cod"),
    amount: zod_1.z.number().nonnegative("Amount must be a positive number"),
    status: zod_1.z.enum(exports.SHIPMENT_STATUSES).default("pending"),
    assignedDriver: zod_1.z.string().nullable().optional(),
    assignedVehicle: zod_1.z.string().nullable().optional(),
    driverStage: zod_1.z.enum(exports.DRIVER_STAGES).nullable().optional(),
    timeline: zod_1.z.array(exports.TimelineEntrySchema).default([]),
});
