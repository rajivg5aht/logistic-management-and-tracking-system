import mongoose, { Document, Schema } from "mongoose";

export const MAINTENANCE_WORK_ORDER_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const MAINTENANCE_WORK_ORDER_STATUSES = [
  "assigned",
  "in_repair",
  "awaiting_verification",
  "closed",
  "cancelled",
] as const;

export type MaintenanceWorkOrderPriority =
  (typeof MAINTENANCE_WORK_ORDER_PRIORITIES)[number];
export type MaintenanceWorkOrderStatus =
  (typeof MAINTENANCE_WORK_ORDER_STATUSES)[number];

export type MaintenanceWorkOrderEvent = {
  fromStatus: MaintenanceWorkOrderStatus | null;
  toStatus: MaintenanceWorkOrderStatus;
  actorId: mongoose.Types.ObjectId;
  actorRole: "admin" | "maintenance";
  note: string;
  createdAt: Date;
};

export interface IMaintenanceWorkOrder extends Document {
  _id: mongoose.Types.ObjectId;
  incidentId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  vendorName: string;
  priority: MaintenanceWorkOrderPriority;
  expectedCompletionAt: Date | null;
  vehicleOutOfService: boolean;
  status: MaintenanceWorkOrderStatus;
  adminNote: string;
  diagnosis: string;
  repairNotes: string;
  partsUsed: string;
  partsCost: number;
  laborCost: number;
  invoiceUrl: string;
  createdBy: mongoose.Types.ObjectId;
  repairStartedAt: Date | null;
  repairCompletedAt: Date | null;
  verifiedBy: mongoose.Types.ObjectId | null;
  verifiedAt: Date | null;
  closedAt: Date | null;
  cancellationReason: string;
  events: MaintenanceWorkOrderEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderEventSchema = new Schema<MaintenanceWorkOrderEvent>(
  {
    fromStatus: {
      type: String,
      enum: MAINTENANCE_WORK_ORDER_STATUSES,
      default: null,
    },
    toStatus: {
      type: String,
      enum: MAINTENANCE_WORK_ORDER_STATUSES,
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, enum: ["admin", "maintenance"], required: true },
    note: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const MaintenanceWorkOrderSchema = new Schema<IMaintenanceWorkOrder>(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "VehicleIncident",
      required: true,
      unique: true,
      index: true,
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    vendorName: { type: String, trim: true, default: "" },
    priority: {
      type: String,
      enum: MAINTENANCE_WORK_ORDER_PRIORITIES,
      default: "medium",
    },
    expectedCompletionAt: { type: Date, default: null },
    vehicleOutOfService: { type: Boolean, default: true },
    status: {
      type: String,
      enum: MAINTENANCE_WORK_ORDER_STATUSES,
      default: "assigned",
      index: true,
    },
    adminNote: { type: String, trim: true, default: "" },
    diagnosis: { type: String, trim: true, default: "" },
    repairNotes: { type: String, trim: true, default: "" },
    partsUsed: { type: String, trim: true, default: "" },
    partsCost: { type: Number, min: 0, default: 0 },
    laborCost: { type: Number, min: 0, default: 0 },
    invoiceUrl: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    repairStartedAt: { type: Date, default: null },
    repairCompletedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    cancellationReason: { type: String, trim: true, default: "" },
    events: { type: [WorkOrderEventSchema], default: [] },
  },
  { timestamps: true },
);

MaintenanceWorkOrderSchema.index({ vehicleId: 1, status: 1 });

export const MaintenanceWorkOrderModel = mongoose.model<IMaintenanceWorkOrder>(
  "MaintenanceWorkOrder",
  MaintenanceWorkOrderSchema,
);