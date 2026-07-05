"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateShipmentDTO = exports.CustomerUpdateShipmentDTO = exports.CreateShipmentDTO = void 0;
const zod_1 = require("zod");
const shipment_type_1 = require("../types/shipment.type");
// DTO used by a customer when confirming & paying for a shipment.
exports.CreateShipmentDTO = zod_1.z.object({
    pickup: shipment_type_1.PickupSchema,
    delivery: shipment_type_1.DeliverySchema,
    package: shipment_type_1.PackageSchema,
    service: zod_1.z.enum(["standard", "express", "overnight"]).default("standard"),
    insurance: zod_1.z.boolean().default(false),
    specialHandling: zod_1.z.boolean().default(false),
    paymentMethod: zod_1.z.enum(shipment_type_1.PAYMENT_METHODS).default("cod"),
    amount: zod_1.z.number().nonnegative("Amount must be a positive number"),
});
// Customers may edit shipment details only while the shipment is pending.
exports.CustomerUpdateShipmentDTO = zod_1.z
    .object({
    pickup: shipment_type_1.PickupSchema.optional(),
    delivery: shipment_type_1.DeliverySchema.optional(),
    package: shipment_type_1.PackageSchema.optional(),
    service: zod_1.z.enum(["standard", "express", "overnight"]).optional(),
    insurance: zod_1.z.boolean().optional(),
    specialHandling: zod_1.z.boolean().optional(),
    amount: zod_1.z.number().nonnegative("Amount must be a positive number").optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one shipment field is required",
});
// DTO used by an admin to update a shipment (status / driver assignment).
exports.AdminUpdateShipmentDTO = zod_1.z.object({
    status: zod_1.z.enum(shipment_type_1.SHIPMENT_STATUSES).optional(),
    assignedDriver: zod_1.z.string().nullable().optional(),
    // Real link to a driver's User account. `null`/"" clears the assignment.
    assignedDriverId: zod_1.z.string().nullable().optional(),
    paymentStatus: zod_1.z.enum(["paid", "pending"]).optional(),
});
