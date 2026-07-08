import mongoose, { Schema, Document } from "mongoose";

// Latest known GPS position reported by a driver for a specific shipment.
// One document per shipment (upserted on every location ping), so this
// collection always holds the current live location, not a historical trail.
export interface IDriverLocation extends Document {
  _id: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  updatedAt: Date;
  createdAt: Date;
}

const DriverLocationSchema: Schema<IDriverLocation> = new Schema(
  {
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
    updatedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

export const DriverLocationModel = mongoose.model<IDriverLocation>(
  "DriverLocation",
  DriverLocationSchema,
  "driver_locations",
);
