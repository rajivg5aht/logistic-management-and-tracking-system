"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const vehicle_model_1 = require("../models/vehicle.model");
const user_model_1 = require("../models/user.model");
const shipment_model_1 = require("../models/shipment.model");
const http_exception_1 = require("../exceptions/http-exception");
const DATE_FIELDS = [
    "insuranceExpiry",
    "registrationExpiry",
    "lastServiceAt",
    "nextServiceAt",
];
class VehicleService {
    normalizeInput(input) {
        const data = { ...input };
        if ("model" in data) {
            data.vehicleModel = data.model;
            delete data.model;
        }
        for (const field of DATE_FIELDS) {
            if (field in data) {
                data[field] = data[field] ? new Date(data[field]) : null;
            }
        }
        return data;
    }
    sanitize(vehicle, driverName = null) {
        return {
            id: vehicle._id.toString(),
            registrationNumber: vehicle.registrationNumber,
            type: vehicle.type,
            make: vehicle.make,
            model: vehicle.vehicleModel,
            year: vehicle.year,
            capacityKg: vehicle.capacityKg,
            branch: vehicle.branch,
            status: vehicle.status,
            insuranceExpiry: vehicle.insuranceExpiry,
            registrationExpiry: vehicle.registrationExpiry,
            lastServiceAt: vehicle.lastServiceAt,
            nextServiceAt: vehicle.nextServiceAt,
            odometerKm: vehicle.odometerKm,
            assignedDriverId: vehicle.assignedDriverId?.toString() ?? null,
            assignedDriverName: driverName,
            assignmentHistory: vehicle.assignmentHistory.map((entry) => ({
                driverId: entry.driverId.toString(),
                assignedAt: entry.assignedAt,
                unassignedAt: entry.unassignedAt ?? null,
            })),
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
        };
    }
    async withDriverNames(vehicles) {
        const driverIds = vehicles
            .map((vehicle) => vehicle.assignedDriverId)
            .filter((id) => !!id);
        const drivers = await user_model_1.UserModel.find({ _id: { $in: driverIds } }).select("_id fullName");
        const names = new Map(drivers.map((driver) => [driver._id.toString(), driver.fullName]));
        return vehicles.map((vehicle) => this.sanitize(vehicle, vehicle.assignedDriverId
            ? names.get(vehicle.assignedDriverId.toString()) ?? null
            : null));
    }
    async getVehicles(page, limit, search = "", status) {
        const query = {};
        if (status)
            query.status = status;
        if (search) {
            query.$or = [
                { registrationNumber: { $regex: search, $options: "i" } },
                { make: { $regex: search, $options: "i" } },
                { vehicleModel: { $regex: search, $options: "i" } },
                { branch: { $regex: search, $options: "i" } },
            ];
        }
        const [vehicles, total] = await Promise.all([
            vehicle_model_1.VehicleModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            vehicle_model_1.VehicleModel.countDocuments(query),
        ]);
        return { vehicles: await this.withDriverNames(vehicles), total };
    }
    async getVehicleById(id) {
        const vehicle = await vehicle_model_1.VehicleModel.findById(id);
        if (!vehicle)
            throw new http_exception_1.HttpException(404, "Vehicle not found");
        const [safeVehicle] = await this.withDriverNames([vehicle]);
        return safeVehicle;
    }
    async getStats() {
        const [total, available, assigned, maintenance, inactive] = await Promise.all([
            vehicle_model_1.VehicleModel.countDocuments(),
            vehicle_model_1.VehicleModel.countDocuments({ status: "available" }),
            vehicle_model_1.VehicleModel.countDocuments({ status: "assigned" }),
            vehicle_model_1.VehicleModel.countDocuments({ status: "maintenance" }),
            vehicle_model_1.VehicleModel.countDocuments({ status: "inactive" }),
        ]);
        return { total, available, assigned, maintenance, inactive };
    }
    async createVehicle(input) {
        const registrationNumber = input.registrationNumber.trim().toUpperCase();
        const existing = await vehicle_model_1.VehicleModel.findOne({ registrationNumber });
        if (existing) {
            throw new http_exception_1.HttpException(400, "Vehicle registration already exists");
        }
        if (input.status === "assigned") {
            throw new http_exception_1.HttpException(400, "Assign a driver after creating the vehicle");
        }
        const vehicle = await vehicle_model_1.VehicleModel.create({
            ...this.normalizeInput(input),
            registrationNumber,
        });
        return this.sanitize(vehicle);
    }
    async updateVehicle(id, input) {
        const vehicle = await vehicle_model_1.VehicleModel.findById(id);
        if (!vehicle)
            throw new http_exception_1.HttpException(404, "Vehicle not found");
        if (input.status &&
            ["maintenance", "inactive"].includes(input.status) &&
            vehicle.assignedDriverId) {
            throw new http_exception_1.HttpException(400, "Unassign the driver before changing this vehicle status");
        }
        if (input.status === "assigned" && !vehicle.assignedDriverId) {
            throw new http_exception_1.HttpException(400, "Use vehicle assignment to set a driver");
        }
        vehicle.set(this.normalizeInput(input));
        await vehicle.save();
        const [safeVehicle] = await this.withDriverNames([vehicle]);
        return safeVehicle;
    }
    async closeCurrentAssignment(vehicle) {
        for (let i = vehicle.assignmentHistory.length - 1; i >= 0; i -= 1) {
            if (!vehicle.assignmentHistory[i].unassignedAt) {
                vehicle.assignmentHistory[i].unassignedAt = new Date();
                break;
            }
        }
    }
    async assignDriver(vehicleId, driverId) {
        const vehicle = await vehicle_model_1.VehicleModel.findById(vehicleId);
        if (!vehicle)
            throw new http_exception_1.HttpException(404, "Vehicle not found");
        const currentDriverId = vehicle.assignedDriverId?.toString() ?? null;
        if (currentDriverId === driverId) {
            const [safeVehicle] = await this.withDriverNames([vehicle]);
            return safeVehicle;
        }
        const driver = driverId ? await user_model_1.UserModel.findById(driverId) : null;
        if (driverId) {
            if (!["available", "assigned"].includes(vehicle.status)) {
                throw new http_exception_1.HttpException(400, "Only available vehicles can be assigned");
            }
            if (!driver || driver.role !== "driver") {
                throw new http_exception_1.HttpException(404, "Driver not found");
            }
            if (driver.status !== "active") {
                throw new http_exception_1.HttpException(400, "Inactive drivers cannot receive vehicles");
            }
            if (!driver.phoneNumber || !driver.licenseNumber) {
                throw new http_exception_1.HttpException(400, "Complete the driver's phone and license details before assignment");
            }
            if (driver.assignedVehicleId &&
                driver.assignedVehicleId.toString() !== vehicleId) {
                throw new http_exception_1.HttpException(400, "This driver is already assigned to another vehicle");
            }
            const otherVehicle = await vehicle_model_1.VehicleModel.findOne({
                _id: { $ne: vehicle._id },
                assignedDriverId: driver._id,
            });
            if (otherVehicle) {
                throw new http_exception_1.HttpException(400, "This driver is already assigned to another vehicle");
            }
        }
        if (currentDriverId) {
            await this.closeCurrentAssignment(vehicle);
            vehicle.assignedDriverId = null;
            vehicle.status = "available";
        }
        if (driver) {
            vehicle.assignedDriverId = driver._id;
            vehicle.status = "assigned";
            vehicle.assignmentHistory.push({
                driverId: driver._id,
                assignedAt: new Date(),
                unassignedAt: null,
            });
        }
        await vehicle.save();
        await Promise.all([
            currentDriverId
                ? user_model_1.UserModel.findByIdAndUpdate(currentDriverId, {
                    assignedVehicleId: null,
                })
                : Promise.resolve(),
            driver
                ? user_model_1.UserModel.findByIdAndUpdate(driver._id, {
                    assignedVehicleId: vehicle._id,
                })
                : Promise.resolve(),
        ]);
        const [safeVehicle] = await this.withDriverNames([vehicle]);
        return safeVehicle;
    }
    async deactivateVehicle(id) {
        const vehicle = await vehicle_model_1.VehicleModel.findById(id);
        if (!vehicle)
            throw new http_exception_1.HttpException(404, "Vehicle not found");
        if (vehicle.assignedDriverId) {
            throw new http_exception_1.HttpException(400, "Unassign the driver before deactivating this vehicle");
        }
        const activeShipments = await shipment_model_1.ShipmentModel.countDocuments({
            assignedVehicleId: vehicle._id,
            status: { $nin: ["delivered", "cancelled"] },
        });
        if (activeShipments > 0) {
            throw new http_exception_1.HttpException(400, "Vehicle has active shipments and cannot be deactivated");
        }
        vehicle.status = "inactive";
        await vehicle.save();
    }
}
exports.VehicleService = VehicleService;
