import mongoose, { Schema, Document } from "mongoose";
import {
  UserType,
  VEHICLE_TYPES,
  EMPLOYMENT_STATUSES,
  AVAILABILITY_STATUSES,
} from "../types/user.type";

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  status?: "active" | "inactive";
  assignedVehicleId?: mongoose.Types.ObjectId | null;
  // Home hub the driver is based at (only meaningful when role === "driver").
  warehouseId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserMongoSchema: Schema<IUser> = new Schema(
  {
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
    vehicleType: { type: String, enum: VEHICLE_TYPES },
    vehicleNumber: { type: String, trim: true, default: "" },
    // Legacy free-text hub label, superseded by warehouseId (kept for migration).
    branch: { type: String, trim: true, default: "" },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },
    employmentStatus: {
      type: String,
      enum: EMPLOYMENT_STATUSES,
      default: "full-time",
    },
    availabilityStatus: {
      type: String,
      enum: AVAILABILITY_STATUSES,
      default: "available",
    },
    assignedVehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);
