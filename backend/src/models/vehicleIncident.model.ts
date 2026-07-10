import mongoose, { Document, Schema } from "mongoose";

export const VEHICLE_INCIDENT_CATEGORIES = [
  "mechanical",
  "damage",
  "tire",
  "brake",
  "engine",
  "other",
] as const;

export const VEHICLE_INCIDENT_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type VehicleIncidentCategory = (typeof VEHICLE_INCIDENT_CATEGORIES)[number];
export type VehicleIncidentSeverity = (typeof VEHICLE_INCIDENT_SEVERITIES)[number];

export interface IVehicleIncident extends Document {
  _id: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  category: VehicleIncidentCategory;
  severity: VehicleIncidentSeverity;
  description: string;
  location: string;
  status: "open" | "reviewing" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const VehicleIncidentSchema = new Schema<IVehicleIncident>(
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
    category: {
      type: String,
      enum: VEHICLE_INCIDENT_CATEGORIES,
      required: true,
    },
    severity: {
      type: String,
      enum: VEHICLE_INCIDENT_SEVERITIES,
      default: "medium",
    },
    description: { type: String, trim: true, required: true },
    location: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved"],
      default: "open",
    },
  },
  { timestamps: true },
);

export const VehicleIncidentModel = mongoose.model<IVehicleIncident>(
  "VehicleIncident",
  VehicleIncidentSchema,
);
