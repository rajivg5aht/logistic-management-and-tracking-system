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
exports.ShipmentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const shipment_type_1 = require("../types/shipment.type");
const AddressSchema = new mongoose_1.Schema({
    fullName: { type: String, trim: true },
    recipientName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    streetAddress: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
}, { _id: false });
const ShipmentMongoSchema = new mongoose_1.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    pickup: { type: AddressSchema, required: true },
    delivery: { type: AddressSchema, required: true },
    package: {
        parcelType: {
            type: String,
            enum: ["standard", "fragile", "pallet"],
            default: "standard",
        },
        weight: { type: String, default: "" },
        quantity: { type: Number, default: 1 },
        dimensions: {
            length: { type: String, default: "" },
            width: { type: String, default: "" },
            height: { type: String, default: "" },
        },
    },
    service: {
        type: String,
        enum: ["standard", "express", "overnight"],
        default: "standard",
    },
    insurance: { type: Boolean, default: false },
    specialHandling: { type: Boolean, default: false },
    paymentMethod: {
        type: String,
        enum: shipment_type_1.PAYMENT_METHODS,
        default: "cod",
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "pending"],
        default: "pending",
    },
    amount: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: shipment_type_1.SHIPMENT_STATUSES,
        default: "pending",
    },
    deliveredAt: {
        type: Date,
        default: null,
    },
    assignedDriver: {
        type: String,
        default: null,
    },
    assignedDriverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    assignedVehicle: {
        type: String,
        default: null,
    },
    assignedVehicleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vehicle",
        default: null,
    },
    driverStage: {
        type: String,
        enum: shipment_type_1.DRIVER_STAGES,
        default: null,
    },
    timeline: {
        type: [
            {
                _id: false,
                stage: { type: String, enum: shipment_type_1.DRIVER_STAGES, required: true },
                at: { type: Date, required: true },
                note: { type: String, default: "" },
            },
        ],
        default: [],
    },
}, {
    timestamps: true,
});
exports.ShipmentModel = mongoose_1.default.model("Shipment", ShipmentMongoSchema);
