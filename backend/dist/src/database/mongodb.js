"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectFromMongoDB = exports.connectToMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constant_1 = require("../configs/constant");
const connectToMongoDB = async () => {
    try {
        await mongoose_1.default.connect(constant_1.MONGODB_URL);
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};
exports.connectToMongoDB = connectToMongoDB;
const disconnectFromMongoDB = async () => {
    try {
        if (mongoose_1.default.connection.readyState === 0)
            return;
        await mongoose_1.default.disconnect();
        console.log("MongoDB disconnected successfully");
    }
    catch (error) {
        console.error("MongoDB disconnection failed:", error);
        throw error;
    }
};
exports.disconnectFromMongoDB = disconnectFromMongoDB;
