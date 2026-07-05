"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryModel = void 0;
const mongoose_1 = require("mongoose");
const inquiry_type_1 = require("../types/inquiry.type");
const InquirySchema = new mongoose_1.Schema({
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
        type: String,
        enum: inquiry_type_1.INQUIRY_CATEGORIES,
        required: true,
        default: "general",
    },
    status: {
        type: String,
        enum: inquiry_type_1.INQUIRY_STATUSES,
        required: true,
        default: "new",
    },
    adminNote: { type: String, trim: true, maxlength: 2000, default: "" },
    adminReply: { type: String, trim: true, maxlength: 4000, default: "" },
    repliedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
}, { timestamps: true });
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, createdAt: -1 });
InquirySchema.index({ email: 1 });
exports.InquiryModel = (0, mongoose_1.model)("Inquiry", InquirySchema);
