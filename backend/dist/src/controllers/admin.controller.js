"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const user_service_1 = require("../services/user.service");
const admin_dto_1 = require("../dtos/admin.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const userService = new user_service_1.UserService();
class AdminController {
    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const { users, total } = await userService.adminGetUsers(page, limit, search);
            const totalPages = Math.ceil(total / limit);
            return apihelper_util_1.ApiResponseHelper.success(res, users, "Users retrieved successfully", 200, {
                page,
                limit,
                total,
                totalPages,
            });
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async getUserById(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid user ID", 400);
            }
            const user = await userService.getUserById(id);
            return apihelper_util_1.ApiResponseHelper.success(res, user, "User retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async createUser(req, res) {
        try {
            const body = { ...req.body };
            // Map name to fullName if provided by frontend
            if (body.name && !body.fullName) {
                body.fullName = body.name;
            }
            const parsedData = admin_dto_1.AdminCreateUserDTO.safeParse(body);
            if (!parsedData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsedData.error), 400);
            }
            // Security: Administrators cannot create another admin account
            if (parsedData.data.role === "admin") {
                return apihelper_util_1.ApiResponseHelper.error(res, "Forbidden - Administrators cannot create another administrator account", 403);
            }
            const user = await userService.adminCreateUser(parsedData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, user, "User created successfully", 201);
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async updateUser(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid user ID", 400);
            }
            // Security: Administrators cannot modify their own accounts in this panel
            const authReq = req;
            if (authReq.user?.id === id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Forbidden - Administrators cannot edit or modify their own accounts in the management panel", 403);
            }
            const body = { ...req.body };
            // Map name to fullName if provided by frontend
            if (body.name && !body.fullName) {
                body.fullName = body.name;
            }
            const parsedData = admin_dto_1.AdminUpdateUserDTO.safeParse(body);
            if (!parsedData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsedData.error), 400);
            }
            // Security: Administrators cannot promote a user to admin role
            if (parsedData.data.role === "admin") {
                return apihelper_util_1.ApiResponseHelper.error(res, "Forbidden - Administrators cannot promote users to the administrator role", 403);
            }
            const updatedUser = await userService.adminUpdateUser(id, parsedData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async deleteUser(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid user ID", 400);
            }
            // Security: Administrators cannot delete their own accounts
            const authReq = req;
            if (authReq.user?.id === id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Forbidden - Administrators cannot delete their own accounts", 403);
            }
            await userService.adminDeleteUser(id);
            return apihelper_util_1.ApiResponseHelper.success(res, null, "User deleted successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
exports.AdminController = AdminController;
