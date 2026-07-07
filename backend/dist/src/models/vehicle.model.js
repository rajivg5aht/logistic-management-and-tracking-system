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
exports.VehicleModel = exports.VEHICLE_STATUSES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_type_1 = require("../types/user.type");
exports.VEHICLE_STATUSES = [
    "available",
    "assigned",
    "maintenance",
    "inactive",
];
const AssignmentSchema = new mongoose_1.Schema({
    driverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    assignedAt: { type: Date, required: true },
    unassignedAt: { type: Date, default: null },
}, { _id: false });
const VehicleSchema = new mongoose_1.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: user_type_1.VEHICLE_TYPES,
        required: true,
    },
    make: { type: String, trim: true, default: "" },
    vehicleModel: { type: String, trim: true, default: "" },
    year: { type: Number },
    capacityKg: { type: Number },
    branch: { type: String, trim: true, default: "" },
    status: {
        type: String,
        enum: exports.VEHICLE_STATUSES,
        default: "available",
    },
    insuranceExpiry: { type: Date, default: null },
    registrationExpiry: { type: Date, default: null },
    lastServiceAt: { type: Date, default: null },
    nextServiceAt: { type: Date, default: null },
    odometerKm: { type: Number, min: 0, default: 0 },
    assignedDriverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    assignmentHistory: {
        type: [AssignmentSchema],
        default: [],
    },
}, { timestamps: true });
exports.VehicleModel = mongoose_1.default.model("Vehicle", VehicleSchema);
