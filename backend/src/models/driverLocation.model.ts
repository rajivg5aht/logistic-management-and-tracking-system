import mongoose, { Schema, Document } from "mongoose";

export interface IDriverLocation extends Document {
  _id: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  isLive: boolean;
  startedAt: Date | null;
  stoppedAt: Date | null;
  updatedAt: Date;
}

const DriverLocationSchema: Schema<IDriverLocation> = new Schema({
  driverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  shipmentId: {
    type: Schema.Types.ObjectId,
    ref: "Shipment",
    required: true,
    unique: true,
  },

  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number, default: null },
  speed: { type: Number, default: null },
  heading: { type: Number, default: null },
  isLive: { type: Boolean, default: false },
  startedAt: { type: Date, default: null },
  stoppedAt: { type: Date, default: null },
  updatedAt: { type: Date, required: true },
});

export const DriverLocationModel = mongoose.model<IDriverLocation>(
  "DriverLocation",
  DriverLocationSchema,
  "driver_locations",
);
