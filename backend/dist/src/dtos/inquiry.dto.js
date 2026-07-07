"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateInquiryDTO = exports.CreateCustomerInquiryDTO = exports.CreateInquiryDTO = void 0;
const zod_1 = require("zod");
const inquiry_type_1 = require("../types/inquiry.type");
exports.CreateInquiryDTO = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Full name is required").max(80),
    email: zod_1.z.email("Enter a valid email address").max(120),
    subject: zod_1.z.string().trim().min(2, "Subject is required").max(120),
    message: zod_1.z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});
exports.CreateCustomerInquiryDTO = zod_1.z.object({
    subject: zod_1.z.string().trim().min(2, "Subject is required").max(120),
    message: zod_1.z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});
exports.AdminUpdateInquiryDTO = zod_1.z
    .object({
    status: zod_1.z.enum(inquiry_type_1.INQUIRY_STATUSES).optional(),
    category: zod_1.z.enum(inquiry_type_1.INQUIRY_CATEGORIES).optional(),
    adminNote: zod_1.z.string().trim().max(2000).optional(),
    adminReply: zod_1.z.string().trim().max(4000).optional(),
})
    .refine((data) => data.status !== undefined ||
    data.category !== undefined ||
    data.adminNote !== undefined ||
    data.adminReply !== undefined, "Provide at least one field to update");
