"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryService = void 0;
const http_exception_1 = require("../exceptions/http-exception");
const inquiry_repository_1 = require("../repositories/inquiry.repository");
const user_repository_1 = require("../repositories/user.repository");
const inquiryRepository = new inquiry_repository_1.InquiryMongoRepository();
const userRepository = new user_repository_1.UserMongoRepository();
class InquiryService {
    sanitize(inquiry) {
        return {
            id: inquiry._id.toString(),
            customer: inquiry.customer?.toString() ?? null,
            fullName: inquiry.fullName,
            email: inquiry.email,
            subject: inquiry.subject,
            message: inquiry.message,
            category: inquiry.category,
            status: inquiry.status,
            adminNote: inquiry.adminNote || "",
            adminReply: inquiry.adminReply || "",
            repliedAt: inquiry.repliedAt ?? null,
            resolvedAt: inquiry.resolvedAt ?? null,
            createdAt: inquiry.createdAt,
            updatedAt: inquiry.updatedAt,
        };
    }
    categoryForSubject(subject) {
        const normalized = subject.toLowerCase();
        if (normalized.includes("support") || normalized.includes("complaint"))
            return "support";
        if (normalized.includes("business") || normalized.includes("partnership"))
            return "sales";
        return "general";
    }
    async create(data) {
        const inquiry = await inquiryRepository.create({
            ...data,
            customer: null,
            category: this.categoryForSubject(data.subject),
            status: "new",
            adminNote: "",
            adminReply: "",
            repliedAt: null,
            resolvedAt: null,
        });
        return this.sanitize(inquiry);
    }
    async list(page, limit, filters) {
        const result = await inquiryRepository.getPaginated(page, limit, filters);
        return {
            inquiries: result.inquiries.map((inquiry) => this.sanitize(inquiry)),
            total: result.total,
        };
    }
    async createForCustomer(customerId, data) {
        const user = await userRepository.getUserById(customerId);
        if (!user)
            throw new http_exception_1.HttpException(404, "Customer account not found");
        const inquiry = await inquiryRepository.create({
            customer: user._id,
            fullName: user.fullName,
            email: user.email,
            subject: data.subject,
            message: data.message,
            category: this.categoryForSubject(data.subject),
            status: "new",
            adminNote: "",
            adminReply: "",
            repliedAt: null,
            resolvedAt: null,
        });
        return this.sanitize(inquiry);
    }
    async listByCustomer(customerId, email) {
        const inquiries = await inquiryRepository.getByCustomerOrEmail(customerId, email);
        return inquiries.map((inquiry) => this.sanitize(inquiry));
    }
    async getById(id) {
        const inquiry = await inquiryRepository.getById(id);
        if (!inquiry)
            throw new http_exception_1.HttpException(404, "Inquiry not found");
        return this.sanitize(inquiry);
    }
    async update(id, data) {
        const current = await inquiryRepository.getById(id);
        if (!current)
            throw new http_exception_1.HttpException(404, "Inquiry not found");
        const updateData = { ...data };
        if (data.adminReply !== undefined) {
            updateData.repliedAt = data.adminReply ? new Date() : null;
        }
        if (data.status === "resolved" && current.status !== "resolved") {
            updateData.resolvedAt = new Date();
        }
        else if (data.status && data.status !== "resolved") {
            updateData.resolvedAt = null;
        }
        const updated = await inquiryRepository.update(id, updateData);
        if (!updated)
            throw new http_exception_1.HttpException(500, "Failed to update inquiry");
        return this.sanitize(updated);
    }
    async delete(id) {
        const exists = await inquiryRepository.getById(id);
        if (!exists)
            throw new http_exception_1.HttpException(404, "Inquiry not found");
        await inquiryRepository.delete(id);
    }
    getStats() {
        return inquiryRepository.getStats();
    }
}
exports.InquiryService = InquiryService;
