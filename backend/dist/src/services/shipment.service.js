"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentService = void 0;
const shipment_repository_1 = require("../repositories/shipment.repository");
const shipment_model_1 = require("../models/shipment.model");
const user_model_1 = require("../models/user.model");
const vehicle_model_1 = require("../models/vehicle.model");
const http_exception_1 = require("../exceptions/http-exception");
const shipmentRepository = new shipment_repository_1.ShipmentMongoRepository();
// A driver's granular stage maps onto the canonical 4-state status that the
// KPIs, 7-day chart, customer badges and filters all depend on. Keeping this in
// one place means the rest of the app never needs to know about driver stages.
const STAGE_TO_STATUS = {
    assigned: "pending",
    "picked-up": "in-transit",
    "in-transit": "in-transit",
    "out-for-delivery": "in-transit",
    delivered: "delivered",
    failed: "in-transit",
    returned: "cancelled",
};
// Allowed forward transitions for a driver-driven delivery.
const STAGE_TRANSITIONS = {
    assigned: ["picked-up", "failed"],
    "picked-up": ["in-transit", "failed"],
    "in-transit": ["out-for-delivery", "failed"],
    "out-for-delivery": ["delivered", "failed"],
    delivered: [],
    failed: ["picked-up", "returned"],
    returned: [],
};
class ShipmentService {
    sanitize(shipment) {
        return {
            id: shipment._id.toString(),
            trackingId: shipment.trackingId,
            customer: shipment.customer?.toString(),
            pickup: shipment.pickup,
            delivery: shipment.delivery,
            package: shipment.package,
            service: shipment.service,
            insurance: shipment.insurance,
            specialHandling: shipment.specialHandling,
            paymentMethod: shipment.paymentMethod,
            paymentStatus: shipment.paymentStatus,
            deliveredAt: shipment.deliveredAt ?? null,
            amount: shipment.amount,
            status: shipment.status,
            assignedDriver: shipment.assignedDriver ?? null,
            assignedDriverId: shipment.assignedDriverId?.toString() ?? null,
            assignedVehicle: shipment.assignedVehicle ?? null,
            assignedVehicleId: shipment.assignedVehicleId?.toString() ?? null,
            driverStage: shipment.driverStage ?? null,
            timeline: shipment.timeline ?? [],
            createdAt: shipment.createdAt,
            updatedAt: shipment.updatedAt,
        };
    }
    // Generates a unique, human-friendly tracking id like "LN-482913".
    async generateTrackingId() {
        for (let attempt = 0; attempt < 6; attempt++) {
            const candidate = `LN-${Math.floor(100000 + Math.random() * 900000)}`;
            const existing = await shipmentRepository.getPaginated(1, 1, candidate);
            if (existing.total === 0)
                return candidate;
        }
        // Fallback that is effectively collision-proof.
        return `LN-${Date.now().toString().slice(-6)}`;
    }
    async createShipment(customerId, data) {
        const trackingId = await this.generateTrackingId();
        // Wallet payments are captured up front; COD is settled on delivery.
        const paymentStatus = data.paymentMethod === "cod" ? "pending" : "paid";
        const shipment = await shipmentRepository.create({
            ...data,
            trackingId,
            customer: customerId,
            paymentStatus,
            status: "pending",
            assignedDriver: null,
            assignedVehicle: null,
        });
        return this.sanitize(shipment);
    }
    async getMyShipments(customerId) {
        const shipments = await shipmentRepository.getByCustomer(customerId);
        return shipments.map((s) => this.sanitize(s));
    }
    // Fetches a shipment and guarantees it belongs to the requesting customer.
    // Prevents one customer from reading or mutating another's shipment.
    async getOwnedShipment(customerId, id) {
        const shipment = await shipmentRepository.getById(id);
        if (!shipment) {
            throw new http_exception_1.HttpException(404, "Shipment not found");
        }
        if (shipment.customer?.toString() !== customerId) {
            throw new http_exception_1.HttpException(403, "You do not have permission to modify this shipment");
        }
        return shipment;
    }
    // Customer edits are only permitted while a shipment is still pending
    // (i.e. it has not been picked up or dispatched yet).
    async customerUpdateShipment(customerId, id, data) {
        const shipment = await this.getOwnedShipment(customerId, id);
        if (shipment.status !== "pending") {
            throw new http_exception_1.HttpException(409, "Only pending shipments can be edited. This shipment is already " +
                shipment.status);
        }
        const updated = await shipmentRepository.update(id, data);
        if (!updated) {
            throw new http_exception_1.HttpException(500, "Failed to update shipment");
        }
        return this.sanitize(updated);
    }
    // Cancellation is allowed while pending; once in transit or delivered the
    // customer must go through support so the operational record stays intact.
    async customerCancelShipment(customerId, id) {
        const shipment = await this.getOwnedShipment(customerId, id);
        if (shipment.status === "cancelled") {
            throw new http_exception_1.HttpException(409, "This shipment is already cancelled");
        }
        if (shipment.status !== "pending") {
            throw new http_exception_1.HttpException(409, "Only pending shipments can be cancelled. Please contact support for shipments already in transit.");
        }
        const updated = await shipmentRepository.update(id, { status: "cancelled" });
        if (!updated) {
            throw new http_exception_1.HttpException(500, "Failed to cancel shipment");
        }
        if (shipment.assignedDriverId) {
            await user_model_1.UserModel.findByIdAndUpdate(shipment.assignedDriverId, {
                availabilityStatus: "available",
            });
        }
        return this.sanitize(updated);
    }
    // Permanent deletion is limited to cancelled shipments so delivered and
    // in-transit records can never be erased by a customer.
    async customerDeleteShipment(customerId, id) {
        const shipment = await this.getOwnedShipment(customerId, id);
        if (shipment.status !== "cancelled") {
            throw new http_exception_1.HttpException(409, "Only cancelled shipments can be deleted. Cancel the shipment first.");
        }
        return shipmentRepository.delete(id);
    }
    async adminGetShipments(page, limit, search, status) {
        const { shipments, total } = await shipmentRepository.getPaginated(page, limit, search, status);
        return {
            shipments: shipments.map((s) => this.sanitize(s)),
            total,
        };
    }
    async adminGetShipmentById(id) {
        const shipment = await shipmentRepository.getById(id);
        if (!shipment) {
            throw new http_exception_1.HttpException(404, "Shipment not found");
        }
        return this.sanitize(shipment);
    }
    async adminUpdateShipment(id, data) {
        const shipment = await shipmentRepository.getById(id);
        if (!shipment) {
            throw new http_exception_1.HttpException(404, "Shipment not found");
        }
        const { assignedDriverId, ...rest } = data;
        const updateData = { ...rest };
        if (data.status === "delivered" && shipment.status !== "delivered") {
            updateData.deliveredAt = new Date();
        }
        else if (data.status && data.status !== "delivered") {
            updateData.deliveredAt = null;
        }
        // Driver assignment: link the real account, denormalize the name, and start
        // the delivery timeline at "assigned".
        if (assignedDriverId !== undefined) {
            const previousDriverId = shipment.assignedDriverId?.toString() ?? null;
            if (assignedDriverId) {
                const driver = await user_model_1.UserModel.findById(assignedDriverId);
                if (!driver || driver.role !== "driver") {
                    throw new http_exception_1.HttpException(400, "Selected driver was not found");
                }
                if (driver.status !== "active") {
                    throw new http_exception_1.HttpException(400, "Inactive drivers cannot receive shipments");
                }
                if (!driver.phoneNumber || !driver.licenseNumber) {
                    throw new http_exception_1.HttpException(400, "Complete the driver's phone and license details before assignment");
                }
                if (previousDriverId !== assignedDriverId) {
                    const activeAssignment = await shipment_model_1.ShipmentModel.findOne({
                        _id: { $ne: shipment._id },
                        assignedDriverId: driver._id,
                        status: { $nin: ["delivered", "cancelled"] },
                    });
                    if (activeAssignment) {
                        throw new http_exception_1.HttpException(400, "This driver already has an active shipment");
                    }
                    if (driver.availabilityStatus !== "available") {
                        throw new http_exception_1.HttpException(400, "Only available drivers can receive shipments");
                    }
                }
                updateData.assignedDriverId = driver._id;
                updateData.assignedDriver = driver.fullName;
                if (driver.assignedVehicleId) {
                    const vehicle = await vehicle_model_1.VehicleModel.findById(driver.assignedVehicleId);
                    if (!vehicle ||
                        vehicle.assignedDriverId?.toString() !== driver._id.toString() ||
                        vehicle.status !== "assigned") {
                        throw new http_exception_1.HttpException(400, "The driver's vehicle assignment is invalid");
                    }
                    updateData.assignedVehicleId = vehicle._id;
                    updateData.assignedVehicle = vehicle.registrationNumber;
                }
                else {
                    updateData.assignedVehicleId = null;
                    updateData.assignedVehicle = null;
                }
                // Only (re)initialise the stage when the driver actually changes.
                if (previousDriverId !== assignedDriverId) {
                    updateData.driverStage = "assigned";
                    updateData.timeline = [
                        ...(shipment.timeline ?? []),
                        { stage: "assigned", at: new Date(), note: "Assigned to driver" },
                    ];
                    await user_model_1.UserModel.findByIdAndUpdate(driver._id, {
                        availabilityStatus: "assigned",
                    });
                    if (previousDriverId) {
                        await user_model_1.UserModel.findByIdAndUpdate(previousDriverId, {
                            availabilityStatus: "available",
                        });
                    }
                }
            }
            else {
                // Clearing the assignment.
                updateData.assignedDriverId = null;
                updateData.assignedDriver = null;
                updateData.assignedVehicleId = null;
                updateData.assignedVehicle = null;
                updateData.driverStage = null;
                if (previousDriverId) {
                    await user_model_1.UserModel.findByIdAndUpdate(previousDriverId, {
                        availabilityStatus: "available",
                    });
                }
            }
        }
        if (data.status &&
            ["delivered", "cancelled"].includes(data.status) &&
            shipment.assignedDriverId) {
            await user_model_1.UserModel.findByIdAndUpdate(shipment.assignedDriverId, {
                availabilityStatus: "available",
            });
        }
        const updated = await shipmentRepository.update(id, updateData);
        if (!updated) {
            throw new http_exception_1.HttpException(500, "Failed to update shipment");
        }
        return this.sanitize(updated);
    }
    async adminDeleteShipment(id) {
        const shipment = await shipmentRepository.getById(id);
        if (!shipment) {
            throw new http_exception_1.HttpException(404, "Shipment not found");
        }
        if (shipment.status !== "cancelled") {
            throw new http_exception_1.HttpException(409, "Only cancelled shipments can be deleted");
        }
        return shipmentRepository.delete(id);
    }
    async getStats() {
        return shipmentRepository.getStats();
    }
    // ── Driver console ─────────────────────────────────────────────────────────
    async getMyAssignments(driverId, scope) {
        const shipments = await shipmentRepository.getByDriver(driverId, scope);
        return shipments.map((s) => this.sanitize(s));
    }
    // Fetches an assignment and guarantees it belongs to the requesting driver.
    async getOwnedAssignment(driverId, id) {
        const shipment = await shipmentRepository.getById(id);
        if (!shipment) {
            throw new http_exception_1.HttpException(404, "Shipment not found");
        }
        if (shipment.assignedDriverId?.toString() !== driverId) {
            throw new http_exception_1.HttpException(403, "This shipment is not assigned to you");
        }
        return shipment;
    }
    async getMyAssignmentById(driverId, id) {
        const shipment = await this.getOwnedAssignment(driverId, id);
        return this.sanitize(shipment);
    }
    // Driver advances the delivery stage. Validates the transition, appends a
    // timeline entry, and syncs the canonical status + the driver's availability.
    async driverUpdateStage(driverId, id, data) {
        const shipment = await this.getOwnedAssignment(driverId, id);
        const current = shipment.driverStage ?? "assigned";
        const next = data.stage;
        if (next !== current) {
            const allowed = STAGE_TRANSITIONS[current] ?? [];
            if (!allowed.includes(next)) {
                throw new http_exception_1.HttpException(409, `Cannot move from "${current}" to "${next}".`);
            }
        }
        const nextStatus = STAGE_TO_STATUS[next];
        const updateData = {
            driverStage: next,
            status: nextStatus,
            timeline: [
                ...(shipment.timeline ?? []),
                { stage: next, at: new Date(), note: data.note ?? "" },
            ],
        };
        if (next === "delivered") {
            updateData.deliveredAt = new Date();
        }
        const updated = await shipmentRepository.update(id, updateData);
        if (!updated) {
            throw new http_exception_1.HttpException(500, "Failed to update delivery stage");
        }
        // Keep the driver's availability in step with what they're doing.
        let availability = null;
        if (["picked-up", "in-transit", "out-for-delivery"].includes(next)) {
            availability = "on-delivery";
        }
        else if (["delivered", "returned"].includes(next)) {
            availability = "available";
        }
        if (availability) {
            await user_model_1.UserModel.findByIdAndUpdate(driverId, {
                availabilityStatus: availability,
            });
        }
        return this.sanitize(updated);
    }
    async getDriverStats(driverId) {
        return shipmentRepository.getDriverStats(driverId);
    }
}
exports.ShipmentService = ShipmentService;
