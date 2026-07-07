"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_type_1 = require("../types/user.type");
const UserMongoSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: false,
        default: "",
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ["admin", "customer", "driver"],
        default: "customer",
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    // ── Driver profile (only populated for role: "driver") ──
    licenseNumber: { type: String, trim: true, default: "" },
    vehicleType: { type: String, enum: user_type_1.VEHICLE_TYPES },
    vehicleNumber: { type: String, trim: true, default: "" },
    branch: { type: String, trim: true, default: "" },
    employmentStatus: {
        type: String,
        enum: user_type_1.EMPLOYMENT_STATUSES,
        default: "full-time",
    },
    availabilityStatus: {
        type: String,
        enum: user_type_1.AVAILABILITY_STATUSES,
        default: "available",
    },
    assignedVehicleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vehicle",
        default: null,
    },
}, {
    timestamps: true,
});
exports.UserModel = mongoose_1.default.model("User", UserMongoSchema);
