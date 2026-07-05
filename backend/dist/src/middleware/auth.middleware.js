"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("../configs/constant");
const http_exception_1 = require("../exceptions/http-exception");
const user_model_1 = require("../models/user.model");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new http_exception_1.HttpException(401, "Unauthorized - No token provided");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new http_exception_1.HttpException(401, "Unauthorized - Invalid token format");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, constant_1.SECRET_KEY);
            const currentUser = await user_model_1.UserModel.findById(decoded.id).select("_id email role status");
            if (!currentUser) {
                throw new http_exception_1.HttpException(401, "Unauthorized - Account not found");
            }
            if (currentUser.status === "inactive") {
                throw new http_exception_1.HttpException(403, "Forbidden - Account is inactive");
            }
            req.user = {
                id: currentUser._id.toString(),
                email: currentUser.email,
                role: currentUser.role,
            };
            next();
        }
        catch (error) {
            if (error instanceof http_exception_1.HttpException) {
                throw error;
            }
            throw new http_exception_1.HttpException(401, "Unauthorized - Invalid or expired token");
        }
    }
    catch (error) {
        return res.status(error.status || 401).json({
            success: false,
            message: error.message || "Unauthorized",
            status: error.status || 401,
        });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new http_exception_1.HttpException(401, "Unauthorized - Please login first");
        }
        if (req.user.role !== "admin") {
            throw new http_exception_1.HttpException(403, "Forbidden - Admin access required");
        }
        next();
    }
    catch (error) {
        return res.status(error.status || 403).json({
            success: false,
            message: error.message || "Forbidden",
            status: error.status || 403,
        });
    }
};
exports.adminMiddleware = adminMiddleware;
const driverMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new http_exception_1.HttpException(401, "Unauthorized - Please login first");
        }
        if (req.user.role !== "driver") {
            throw new http_exception_1.HttpException(403, "Forbidden - Driver access required");
        }
        next();
    }
    catch (error) {
        return res.status(error.status || 403).json({
            success: false,
            message: error.message || "Forbidden",
            status: error.status || 403,
        });
    }
};
exports.driverMiddleware = driverMiddleware;
