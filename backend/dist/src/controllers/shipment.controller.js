"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const shipment_service_1 = require("../services/shipment.service");
const shipment_dto_1 = require("../dtos/shipment.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const shipment_type_1 = require("../types/shipment.type");
const shipmentService = new shipment_service_1.ShipmentService();
class ShipmentController {
    // ── Customer: create a shipment (confirm & pay) ──────────────────────────
    async createShipment(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const parsed = shipment_dto_1.CreateShipmentDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const shipment = await shipmentService.createShipment(req.user.id, parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, shipment, "Shipment created successfully", 201);
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Customer: list own shipments ─────────────────────────────────────────
    async getMyShipments(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const shipments = await shipmentService.getMyShipments(req.user.id);
            return apihelper_util_1.ApiResponseHelper.success(res, shipments, "Shipments retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Customer: edit own pending shipment ──────────────────────────────────
    async customerUpdateShipment(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            const parsed = shipment_dto_1.CustomerUpdateShipmentDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const updated = await shipmentService.customerUpdateShipment(req.user.id, id, parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, updated, "Shipment updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Customer: cancel own pending shipment ────────────────────────────────
    async customerCancelShipment(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            const updated = await shipmentService.customerCancelShipment(req.user.id, id);
            return apihelper_util_1.ApiResponseHelper.success(res, updated, "Shipment cancelled successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Customer: delete own cancelled shipment ──────────────────────────────
    async customerDeleteShipment(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            await shipmentService.customerDeleteShipment(req.user.id, id);
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Shipment deleted successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Admin: paginated list ────────────────────────────────────────────────
    async adminGetShipments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const statusParam = req.query.status;
            const status = statusParam && shipment_type_1.SHIPMENT_STATUSES.includes(statusParam)
                ? statusParam
                : undefined;
            const { shipments, total } = await shipmentService.adminGetShipments(page, limit, search, status);
            const totalPages = Math.ceil(total / limit);
            return apihelper_util_1.ApiResponseHelper.success(res, shipments, "Shipments retrieved successfully", 200, { page, limit, total, totalPages });
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Admin: aggregated stats for KPI cards ────────────────────────────────
    async adminGetStats(req, res) {
        try {
            const stats = await shipmentService.getStats();
            return apihelper_util_1.ApiResponseHelper.success(res, stats, "Shipment stats retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Admin: get one ───────────────────────────────────────────────────────
    async adminGetShipmentById(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            const shipment = await shipmentService.adminGetShipmentById(id);
            return apihelper_util_1.ApiResponseHelper.success(res, shipment, "Shipment retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Admin: update (status / driver) ──────────────────────────────────────
    async adminUpdateShipment(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            const parsed = shipment_dto_1.AdminUpdateShipmentDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const updated = await shipmentService.adminUpdateShipment(id, parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, updated, "Shipment updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    // ── Admin: delete ────────────────────────────────────────────────────────
    async adminDeleteShipment(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid shipment ID", 400);
            }
            await shipmentService.adminDeleteShipment(id);
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Shipment deleted successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
exports.ShipmentController = ShipmentController;
