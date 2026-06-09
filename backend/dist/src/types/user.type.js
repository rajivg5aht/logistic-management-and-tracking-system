"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const zod_1 = require("zod");
exports.UserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phoneNumber: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits long"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 character long"),
    role: zod_1.z.enum(["admin", "user"]).default("user"),
});
