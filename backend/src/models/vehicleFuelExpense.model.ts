import mongoose, { Document, Schema } from "mongoose";

export const VEHICLE_FUEL_TYPES = ["petrol", "diesel", "electric", "other"] as const;

export const VEHICLE_FUEL_EXPENSE_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "reimbursed",
] as const;

export type VehicleFuelType = (typeof VEHICLE_FUEL_TYPES)[number];
export type VehicleFuelExpenseStatus =
  (typeof VEHICLE_FUEL_EXPENSE_STATUSES)[number];

export interface IVehicleFuelExpense extends Document {
  _id: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  fuelType: VehicleFuelType;
  liters?: number;
  amount: number;
  odometerKm: number;
  stationName: string;
  notes: string;
  receiptUrl: string;
  status: VehicleFuelExpenseStatus;
  adminNote: string;
  rejectionReason: string;
  approvedBy: mongoose.Types.ObjectId | null;
  approvedAt: Date | null;
  reimbursedBy: mongoose.Types.ObjectId | null;
  reimbursedAt: Date | null;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleFuelExpenseSchema = new Schema<IVehicleFuelExpense>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fuelType: {
      type: String,
      enum: VEHICLE_FUEL_TYPES,
      required: true,
    },
    liters: { type: Number, min: 0 },
    amount: { type: Number, min: 0, required: true },
    odometerKm: { type: Number, min: 0, required: true },
    stationName: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    receiptUrl: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: VEHICLE_FUEL_EXPENSE_STATUSES,
      default: "submitted",
    },
    adminNote: { type: String, trim: true, default: "" },
    rejectionReason: { type: String, trim: true, default: "" },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: { type: Date, default: null },
    reimbursedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reimbursedAt: { type: Date, default: null },
    paymentReference: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export const VehicleFuelExpenseModel = mongoose.model<IVehicleFuelExpense>(
  "VehicleFuelExpense",
  VehicleFuelExpenseSchema,
);
