import mongoose, { Document, Schema } from "mongoose";
import { VEHICLE_TYPES, VehicleType } from "../types/user.type";

export const VEHICLE_STATUSES = [
  "available",
  "assigned",
  "maintenance",
  "inactive",
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export interface IVehicleAssignment {
  driverId: mongoose.Types.ObjectId;
  assignedAt: Date;
  unassignedAt: Date | null;
}

export interface IVehicle extends Document {
  _id: mongoose.Types.ObjectId;
  registrationNumber: string;
  type: VehicleType;
  make: string;
  vehicleModel: string;
  year?: number;
  capacityKg?: number;
  branch: string;
  // Home hub the vehicle is stationed at.
  warehouseId: mongoose.Types.ObjectId | null;
  imageUrl: string | null;
  status: VehicleStatus;
  insuranceExpiry: Date | null;
  registrationExpiry: Date | null;
  lastServiceAt: Date | null;
  nextServiceAt: Date | null;
  odometerKm: number;
  assignedDriverId: mongoose.Types.ObjectId | null;
  assignmentHistory: IVehicleAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IVehicleAssignment>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: { type: Date, required: true },
    unassignedAt: { type: Date, default: null },
  },
  { _id: false },
);

const VehicleSchema = new Schema<IVehicle>(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    make: { type: String, trim: true, default: "" },
    vehicleModel: { type: String, trim: true, default: "" },
    year: { type: Number },
    capacityKg: { type: Number },
    // Legacy free-text hub label, superseded by warehouseId (kept for migration).
    branch: { type: String, trim: true, default: "" },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },
    imageUrl: { type: String, default: null },
    status: {
      type: String,
      enum: VEHICLE_STATUSES,
      default: "available",
    },
    insuranceExpiry: { type: Date, default: null },
    registrationExpiry: { type: Date, default: null },
    lastServiceAt: { type: Date, default: null },
    nextServiceAt: { type: Date, default: null },
    odometerKm: { type: Number, min: 0, default: 0 },
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignmentHistory: {
      type: [AssignmentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const VehicleModel = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
