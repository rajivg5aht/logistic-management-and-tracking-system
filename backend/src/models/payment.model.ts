import mongoose, { Document, Schema } from "mongoose";
import { PAYMENT_METHODS, type PaymentMethod } from "../types/shipment.type";

export const PAYMENT_TYPES = ["charge", "refund"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "collected",
  "settled",
  "refunded",
  "failed",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference: string;
  collectedByDriverId: mongoose.Types.ObjectId | null;
  collectedAt: Date | null;
  settledByAdminId: mongoose.Types.ObjectId | null;
  settledAt: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: PAYMENT_TYPES,
      default: "charge",
      required: true,
    },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    amount: { type: Number, min: 0, required: true },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      index: true,
    },
    reference: { type: String, trim: true, default: "" },
    collectedByDriverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    collectedAt: { type: Date, default: null },
    settledByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    settledAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

PaymentSchema.index({ createdAt: -1 });

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
