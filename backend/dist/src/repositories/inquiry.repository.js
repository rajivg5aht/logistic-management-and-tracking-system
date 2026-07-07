"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryMongoRepository = void 0;
const inquiry_model_1 = require("../models/inquiry.model");
class InquiryMongoRepository {
    create(data) {
        return inquiry_model_1.InquiryModel.create(data);
    }
    getById(id) {
        return inquiry_model_1.InquiryModel.findById(id);
    }
    getByCustomerOrEmail(customerId, email) {
        return inquiry_model_1.InquiryModel.find({
            $or: [{ customer: customerId }, { customer: null, email: email.toLowerCase() }],
        }).sort({ createdAt: -1 });
    }
    update(id, data) {
        return inquiry_model_1.InquiryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async delete(id) {
        const deleted = await inquiry_model_1.InquiryModel.findByIdAndDelete(id);
        return Boolean(deleted);
    }
    async getPaginated(page, limit, filters) {
        const query = {};
        if (filters.status)
            query.status = filters.status;
        if (filters.category)
            query.category = filters.category;
        if (filters.search) {
            const pattern = { $regex: filters.search, $options: "i" };
            query.$or = [
                { fullName: pattern },
                { email: pattern },
                { subject: pattern },
                { message: pattern },
            ];
        }
        const [inquiries, total] = await Promise.all([
            inquiry_model_1.InquiryModel.find(query)
                .sort({ createdAt: filters.sort === "oldest" ? 1 : -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            inquiry_model_1.InquiryModel.countDocuments(query),
        ]);
        return { inquiries, total };
    }
    async getStats() {
        const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
        const nowInNepal = new Date(Date.now() + nepalOffsetMs);
        const todayStart = new Date(Date.UTC(nowInNepal.getUTCFullYear(), nowInNepal.getUTCMonth(), nowInNepal.getUTCDate()) - nepalOffsetMs);
        const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        const [total, pending, resolved, newToday] = await Promise.all([
            inquiry_model_1.InquiryModel.countDocuments({}),
            inquiry_model_1.InquiryModel.countDocuments({ status: { $ne: "resolved" } }),
            inquiry_model_1.InquiryModel.countDocuments({ status: "resolved" }),
            inquiry_model_1.InquiryModel.countDocuments({ createdAt: { $gte: todayStart, $lt: tomorrowStart } }),
        ]);
        return {
            total,
            pending,
            resolved,
            newToday,
            resolvedRate: total === 0 ? 0 : Math.round((resolved / total) * 1000) / 10,
        };
    }
}
exports.InquiryMongoRepository = InquiryMongoRepository;
