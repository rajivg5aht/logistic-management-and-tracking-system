"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const inquiry_dto_1 = require("../dtos/inquiry.dto");
const inquiry_service_1 = require("../services/inquiry.service");
const inquiry_type_1 = require("../types/inquiry.type");
const apihelper_util_1 = require("../utils/apihelper.util");
const inquiryService = new inquiry_service_1.InquiryService();
class InquiryController {
    async create(req, res) {
        try {
            const parsed = inquiry_dto_1.CreateInquiryDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const inquiry = await inquiryService.create(parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, inquiry, "Message sent successfully", 201);
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async createMy(req, res) {
        try {
            if (!req.user)
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            const parsed = inquiry_dto_1.CreateCustomerInquiryDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            const inquiry = await inquiryService.createForCustomer(req.user.id, parsed.data);
            return apihelper_util_1.ApiResponseHelper.success(res, inquiry, "Inquiry created successfully", 201);
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async getMy(req, res) {
        try {
            if (!req.user)
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            const inquiries = await inquiryService.listByCustomer(req.user.id, req.user.email);
            return apihelper_util_1.ApiResponseHelper.success(res, inquiries, "Customer inquiries retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async list(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
            const search = (req.query.search || "").trim();
            const statusParam = req.query.status;
            const categoryParam = req.query.category;
            const sort = req.query.sort === "oldest" ? "oldest" : "newest";
            const status = statusParam && inquiry_type_1.INQUIRY_STATUSES.includes(statusParam)
                ? statusParam
                : undefined;
            const category = categoryParam && inquiry_type_1.INQUIRY_CATEGORIES.includes(categoryParam)
                ? categoryParam
                : undefined;
            const result = await inquiryService.list(page, limit, { search, status, category, sort });
            return apihelper_util_1.ApiResponseHelper.success(res, result.inquiries, "Inquiries retrieved successfully", 200, { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) });
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async stats(req, res) {
        try {
            return apihelper_util_1.ApiResponseHelper.success(res, await inquiryService.getStats(), "Inquiry statistics retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async getById(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid inquiry ID", 400);
            }
            return apihelper_util_1.ApiResponseHelper.success(res, await inquiryService.getById(id), "Inquiry retrieved successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async update(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid inquiry ID", 400);
            }
            const parsed = inquiry_dto_1.AdminUpdateInquiryDTO.safeParse(req.body);
            if (!parsed.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsed.error), 400);
            }
            return apihelper_util_1.ApiResponseHelper.success(res, await inquiryService.update(id, parsed.data), "Inquiry updated successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async delete(req, res) {
        try {
            const id = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid inquiry ID", 400);
            }
            await inquiryService.delete(id);
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Inquiry deleted successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
exports.InquiryController = InquiryController;
