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
            profileImage: user.profileImage || null,
            role: user.role,
        };
    }
    async createUser(userData) {
        try {
            console.log("========== REGISTER START ==========");
            console.log("Incoming Data:", userData);
            console.log("STEP 1: Checking existing email");
            const existingEmail = await userRepository.getUserByEmail(userData.email);
            console.log("STEP 2: Email check completed");
            if (existingEmail) {
                console.log("STEP 2A: Email already exists");
                throw new http_exception_1.HttpException(400, "Email already exists");
            }
            console.log("STEP 3: Hashing password");
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
            console.log("STEP 4: Password hashed");
            console.log("STEP 5: Creating user in database");
            const user = await userRepository.createUser({
                ...userData,
                password: hashedPassword,
            });
            console.log("STEP 6: User created successfully");
            console.log("User ID:", user._id);
            console.log("========== REGISTER END ==========");
            return this.sanitizeUser(user);
        }
        catch (error) {
            console.error("========== REGISTER ERROR ==========");
            console.error(error);
            console.error("===================================");
            throw error;
        }
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
    async getUserById(userId) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        return this.sanitizeUser(user);
    }
    async updateUser(userId, updateData) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        // If email is being updated, check if it's already taken
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingEmail) {
                throw new http_exception_1.HttpException(400, "Email already exists");
            }
        }
        // Hash password if it's being updated
        if (updateData.password) {
            updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
        }
        const updatedUser = await userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw new http_exception_1.HttpException(500, "Failed to update user");
        }
        return this.sanitizeUser(updatedUser);
    }
}
exports.UserService = UserService;
