"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET_KEY = exports.MONGODB_URL = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = Number(process.env.PORT) || 4000;
exports.MONGODB_URL = process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    "mongodb://localhost:27017/logistics";
exports.SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY || "merosecretkey";
