import mongoose, { Schema, Document } from "mongoose";
import {
  ShipmentType,
  SHIPMENT_STATUSES,
  DRIVER_STAGES,
  PAYMENT_METHODS,
} from "../types/shipment.type";

export interface IShipment extends ShipmentType, Document {
  _id: mongoose.Types.ObjectId;
  trackingId: string;
  customer: mongoose.Types.ObjectId;
  paymentStatus: "paid" | "pending";
  deliveredAt: Date | null;
  // Real link to the driver's User account (name is denormalized in assignedDriver).
  assignedDriverId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    fullName: { type: String, trim: true },
    recipientName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    streetAddress: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
  },
  { _id: false },
);

const ShipmentMongoSchema: Schema<IShipment> = new Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
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
      enum: PAYMENT_METHODS,
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
      enum: SHIPMENT_STATUSES,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    driverStage: {
      type: String,
      enum: DRIVER_STAGES,
      default: null,
    },

    timeline: {
      type: [
        {
          _id: false,
          stage: { type: String, enum: DRIVER_STAGES, required: true },
          at: { type: Date, required: true },
          note: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const ShipmentModel = mongoose.model<IShipment>(
  "Shipment",
  ShipmentMongoSchema,
);
