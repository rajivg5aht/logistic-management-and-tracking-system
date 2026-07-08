import mongoose, { Schema, Document } from "mongoose";
import {
  ShipmentType,
  SHIPMENT_STATUSES,
  DRIVER_STAGES,
  PAYMENT_METHODS,
} from "../types/shipment.type";

export interface IProofOfDelivery {
  photoUrl: string | null;
  notes: string;
  recipientName: string;
  confirmedAt: Date | null;
  confirmedByDriverId: mongoose.Types.ObjectId | null;
  updatedAt: Date | null;
}

// Latest live GPS position of the assigned driver, mirrored from the
// driver_locations collection so it travels with the shipment document.
export interface ICurrentLocation {
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

export interface IShipment extends ShipmentType, Document {
  _id: mongoose.Types.ObjectId;
  trackingId: string;
  customer: mongoose.Types.ObjectId;
  paymentStatus: "paid" | "pending";
  deliveredAt: Date | null;
  proofOfDelivery: IProofOfDelivery | null;
  // Real link to the driver's User account (name is denormalized in assignedDriver).
  assignedDriverId: mongoose.Types.ObjectId | null;
  assignedVehicleId: mongoose.Types.ObjectId | null;
  currentLocation: ICurrentLocation | null;
  createdAt: Date;
  updatedAt: Date;
}

const CurrentLocationSchema = new Schema<ICurrentLocation>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    updatedAt: { type: Date, required: true },
  },
  { _id: false },
);

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

const ProofOfDeliverySchema = new Schema<IProofOfDelivery>(
  {
    photoUrl: { type: String, default: null },
    notes: { type: String, trim: true, default: "" },
    recipientName: { type: String, trim: true, default: "" },
    confirmedAt: { type: Date, default: null },
    confirmedByDriverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedAt: { type: Date, default: null },
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

    proofOfDelivery: {
      type: ProofOfDeliverySchema,
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

    assignedVehicle: {
      type: String,
      default: null,
    },

    assignedVehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    driverStage: {
      type: String,
      enum: DRIVER_STAGES,
      default: null,
    },

    currentLocation: {
      type: CurrentLocationSchema,
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
