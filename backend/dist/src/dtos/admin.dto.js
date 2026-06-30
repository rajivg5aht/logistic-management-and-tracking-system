"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateUserDTO = exports.AdminCreateUserDTO = void 0;
const zod_1 = require("zod");
exports.AdminCreateUserDTO = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    role: zod_1.z.enum(["admin", "customer", "driver"]).default("customer"),
    phoneNumber: zod_1.z.string().optional().default(""),
});
exports.AdminUpdateUserDTO = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required").optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    role: zod_1.z.enum(["admin", "customer", "driver"]).optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long").optional(),
    phoneNumber: zod_1.z.string().optional(),
});
