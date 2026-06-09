"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserDTO = exports.CreateUserDTO = void 0;
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
