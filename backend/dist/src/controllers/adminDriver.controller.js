"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDriverController = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const user_service_1 = require("../services/user.service");
const driver_dto_1 = require("../dtos/driver.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const user_type_1 = require("../types/user.type");
const userService = new user_service_1.UserService();
class AdminDriverController {
    // ── List drivers (paginated, searchable, filterable by availability) ───────
    async getDrivers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const availabilityParam = req.query.availability;
            const availability = availabilityParam &&
                user_type_1.AVAILABILITY_STATUSES.includes(availabilityParam)
                ? availabilityParam
                : undefined;
            const { drivers, total } = await userService.adminGetDrivers(page, limit, search, availability);
            const totalPages = Math.ceil(total / limit);
            return apihelper_util_1.ApiResponseHelper.success(res, drivers, "Drivers retrieved successfully", 200, { page, limit, total, totalPages });
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async getDriverById(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid driver ID", 400);
            }
            const driver = await userService.adminGetDriverById(id);
            return apihelper_util_1.ApiResponseHelper.success(res, driver, "Driver retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async createDriver(req, res) {
        try {
            const parsed = driver_dto_1.AdminCreateDriverDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const driver = await userService.adminCreateDriver(parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, driver, "Driver created successfully", 201);
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async updateDriver(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid driver ID", 400);
            }
            const parsed = driver_dto_1.AdminUpdateDriverDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const updated = await userService.adminUpdateDriver(id, parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, updated, "Driver updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async deleteDriver(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid driver ID", 400);
            }
            await userService.adminDeleteDriver(id);
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Driver deactivated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
exports.AdminDriverController = AdminDriverController;
