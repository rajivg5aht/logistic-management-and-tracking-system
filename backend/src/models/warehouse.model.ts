import mongoose, { Document, Schema } from "mongoose";

export const WAREHOUSE_STATUSES = ["active", "inactive"] as const;

export type WarehouseStatus = (typeof WAREHOUSE_STATUSES)[number];

export interface IWarehouse extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  streetAddress: string;
  city: string;
  district: string;
  contactPhone: string;
  managerName: string;
  capacity: number;
  status: WarehouseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    streetAddress: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    managerName: { type: String, trim: true, default: "" },
    capacity: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: WAREHOUSE_STATUSES,
      default: "active",
    },
  },
  { timestamps: true },
);

export const WarehouseModel = mongoose.model<IWarehouse>(
  "Warehouse",
  WarehouseSchema,
);
