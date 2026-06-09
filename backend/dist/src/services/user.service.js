"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const http_exception_1 = require("../exceptions/http-exception");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("../configs/constant");
const userRepository = new user_repository_1.UserMongoRepository();
class UserService {
    sanitizeUser(user) {
        return {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };
    }
    async createUser(userData) {
        // Check existing email
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new http_exception_1.HttpException(400, "Email already exists");
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
        const user = await userRepository.createUser({
            ...userData,
            password: hashedPassword,
        });
        return this.sanitizeUser(user);
    }
    async loginUser(loginData) {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new http_exception_1.HttpException(401, "Invalid email or password");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new http_exception_1.HttpException(401, "Invalid email or password");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role,
        }, constant_1.SECRET_KEY, {
            expiresIn: "30d",
        });
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
}
exports.UserService = UserService;
