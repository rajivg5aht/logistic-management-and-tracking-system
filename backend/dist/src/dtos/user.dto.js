"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDTO = exports.LoginUserDTO = exports.CreateUserDTO = void 0;
const zod_1 = require("zod");
const user_type_1 = require("../types/user.type");
// DTO for user registration
exports.CreateUserDTO = user_type_1.UserSchema.pick({
    fullName: true,
    email: true,
    phoneNumber: true,
    password: true,
});
// DTO for user login
exports.LoginUserDTO = user_type_1.UserSchema.pick({
    email: true,
    password: true,
});
// DTO for user update
exports.UpdateUserDTO = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required").optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    phoneNumber: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits long")
        .optional(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 character long")
        .optional(),
    profileImage: zod_1.z.string().optional(),
});
