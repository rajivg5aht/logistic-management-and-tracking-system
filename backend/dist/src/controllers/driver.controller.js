"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const shipment_service_1 = require("../services/shipment.service");
const user_service_1 = require("../services/user.service");
const driver_dto_1 = require("../dtos/driver.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const shipmentService = new shipment_service_1.ShipmentService();
const userService = new user_service_1.UserService();
class DriverController {
    // ── Driver: list shipments assigned to me ────────────────────────────────
    async getMyAssignments(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const scopeParam = req.query.scope;
            const scope = scopeParam === "active" || scopeParam === "history"
                ? scopeParam
                : undefined;
            const shipments = await shipmentService.getMyAssignments(req.user.id, scope);
            return apihelper_util_1.ApiResponseHelper.success(res, shipments, "Assignments retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Driver: get one of my assignments ────────────────────────────────────
    async getAssignmentById(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            const shipment = await shipmentService.getMyAssignmentById(req.user.id, id);
            return apihelper_util_1.ApiResponseHelper.success(res, shipment, "Assignment retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Driver: advance the delivery stage ───────────────────────────────────
    async updateStage(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            const parsed = driver_dto_1.DriverStageUpdateDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const updated = await shipmentService.driverUpdateStage(req.user.id, id, parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, updated, "Delivery stage updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Driver: my dashboard stats ───────────────────────────────────────────
    async getStats(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const stats = await shipmentService.getDriverStats(req.user.id);
            return apihelper_util_1.ApiResponseHelper.success(res, stats, "Driver stats retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Driver: toggle my own availability ───────────────────────────────────
    async updateAvailability(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const parsed = driver_dto_1.DriverAvailabilityDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const updated = await userService.updateAvailability(req.user.id, parsed.data.availabilityStatus);
            return apihelper_util_1.ApiResponseHelper.success(res, updated, "Availability updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
exports.DriverController = DriverController;
