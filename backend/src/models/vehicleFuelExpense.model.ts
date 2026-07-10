import mongoose, { Document, Schema } from "mongoose";

export const VEHICLE_FUEL_TYPES = ["petrol", "diesel", "electric", "other"] as const;

export type VehicleFuelType = (typeof VEHICLE_FUEL_TYPES)[number];

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
  status: "submitted" | "approved" | "rejected";
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
    status: {
      type: String,
      enum: ["submitted", "approved", "rejected"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

export const VehicleFuelExpenseModel = mongoose.model<IVehicleFuelExpense>(
  "VehicleFuelExpense",
  VehicleFuelExpenseSchema,
);
