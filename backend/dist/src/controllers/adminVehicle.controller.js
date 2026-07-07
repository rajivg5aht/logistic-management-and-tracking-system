"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminVehicleController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const apihelper_util_1 = require("../utils/apihelper.util");
const vehicle_service_1 = require("../services/vehicle.service");
const vehicle_dto_1 = require("../dtos/vehicle.dto");
const vehicle_model_1 = require("../models/vehicle.model");
const vehicleService = new vehicle_service_1.VehicleService();
class AdminVehicleController {
    async getVehicles(req, res) {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 200);
            const search = req.query.search || "";
            const requestedStatus = req.query.status;
            const status = requestedStatus &&
                vehicle_model_1.VEHICLE_STATUSES.includes(requestedStatus)
                ? requestedStatus
                : undefined;
            const { vehicles, total } = await vehicleService.getVehicles(page, limit, search, status);
            return apihelper_util_1.ApiResponseHelper.success(res, vehicles, "Vehicles retrieved successfully", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async getStats(_req, res) {
        try {
            const stats = await vehicleService.getStats();
            return apihelper_util_1.ApiResponseHelper.success(res, stats, "Fleet statistics retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async getVehicleById(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
            }
            const vehicle = await vehicleService.getVehicleById(id);
            return apihelper_util_1.ApiResponseHelper.success(res, vehicle, "Vehicle retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async createVehicle(req, res) {
        try {
            const parsed = vehicle_dto_1.AdminCreateVehicleDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const vehicle = await vehicleService.createVehicle(parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, vehicle, "Vehicle created successfully", 201);
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async updateVehicle(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
            }
            const parsed = vehicle_dto_1.AdminUpdateVehicleDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const vehicle = await vehicleService.updateVehicle(id, parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, vehicle, "Vehicle updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async assignDriver(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
            }
            const parsed = vehicle_dto_1.AdminAssignVehicleDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            if (parsed.data.driverId &&
                !mongoose_1.default.Types.ObjectId.isValid(parsed.data.driverId)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid driver ID", 400);
            }
            const vehicle = await vehicleService.assignDriver(id, parsed.data.driverId);
            return apihelper_util_1.ApiResponseHelper.success(res, vehicle, parsed.data.driverId
                ? "Driver assigned successfully"
                : "Driver unassigned successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async deactivateVehicle(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
            }
            await vehicleService.deactivateVehicle(id);
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Vehicle deactivated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
exports.AdminVehicleController = AdminVehicleController;
