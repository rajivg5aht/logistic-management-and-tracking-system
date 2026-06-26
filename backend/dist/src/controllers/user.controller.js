"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const zod_1 = require("zod");
const user_dto_1 = require("../dtos/user.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const userService = new user_service_1.UserService();
class UserController {
    async createUser(req, res) {
        try {
            const userData = user_dto_1.CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(userData.error), 400);
            }
            const user = await userService.createUser(userData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, user, "User created successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async loginUser(req, res) {
        try {
            const parsedData = user_dto_1.LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsedData.error), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, { user, token }, "Login successful");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async whoami(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const user = await userService.getUserById(req.user.id);
            return apihelper_util_1.ApiResponseHelper.success(res, user, "User retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async updateUser(req, res) {
        try {
            if (!req.user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const updateData = { ...req.body };
            // If file was uploaded, add the file path
            if (req.file) {
                updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
            }
            const parsedData = user_dto_1.UpdateUserDTO.safeParse(updateData);
            if (!parsedData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsedData.error), 400);
            }
            const updatedUser = await userService.updateUser(req.user.id, parsedData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
exports.UserController = UserController;
