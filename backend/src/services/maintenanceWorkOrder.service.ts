import mongoose from "mongoose";
import { HttpException } from "../exceptions/http-exception";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";
import {
  MaintenanceWorkOrderModel,
  type IMaintenanceWorkOrder,
  type MaintenanceWorkOrderStatus,
} from "../models/maintenanceWorkOrder.model";
import { VehicleIncidentModel } from "../models/vehicleIncident.model";
import type {
  AdminUpdateMaintenanceWorkOrderDTO,
  CreateMaintenanceWorkOrderDTO,
  MaintenanceWorkOrderUpdateDTO,
} from "../dtos/maintenanceWorkOrder.dto";

const ACTIVE_WORK_ORDER_STATUSES: MaintenanceWorkOrderStatus[] = [
  "assigned",
  "in_repair",
  "awaiting_verification",
];

type ListParams = {
  status?: string;
  page: number;
  limit: number;
};

export type MaintenanceWorkOrder = {
  id: string;
  incidentId: string;
  incidentCategory: string;
  incidentDescription: string;
  incidentLocation: string;
  vehicleId: string;
  vehicleRegistration: string | null;
  driverId: string;
  driverName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  vendorName: string;
  priority: string;
  expectedCompletionAt: Date | null;
  vehicleOutOfService: boolean;
  status: string;
  adminNote: string;
  diagnosis: string;
  repairNotes: string;
  partsUsed: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  invoiceUrl: string;
  repairStartedAt: Date | null;
  repairCompletedAt: Date | null;
  verifiedAt: Date | null;
  closedAt: Date | null;
  cancellationReason: string;
  events: Array<{
    fromStatus: string | null;
    toStatus: string;
    actorId: string;
    actorName: string | null;
    actorRole: "admin" | "maintenance";
    note: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

function clean(value?: string | null): string {
  return value?.trim() ?? "";
}

function objectId(value: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(value);
}

function parseOptionalDate(value?: string): Date | null {
  const next = clean(value);
  if (!next) return null;
  const date = new Date(next);
  if (Number.isNaN(date.getTime())) {
    throw new HttpException(400, "Expected completion date is invalid");
  }
  return date;
}

export class MaintenanceWorkOrderService {
  private async getMaintenanceUser(id: string | null | undefined) {
    if (!id) return null;
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpException(400, "Invalid maintenance user");
    }

    const user = await UserModel.findById(id).select("_id fullName role status");
    if (!user || user.role !== "maintenance") {
      throw new HttpException(404, "Maintenance user not found");
    }
    if (user.status !== "active") {
      throw new HttpException(400, "Inactive maintenance users cannot receive work orders");
    }
    return user;
  }

  private async getLookups(workOrders: IMaintenanceWorkOrder[]) {
    const userIds = new Set<string>();
    const vehicleIds = new Set<string>();
    const incidentIds = new Set<string>();

    for (const workOrder of workOrders) {
      userIds.add(workOrder.driverId.toString());
      userIds.add(workOrder.createdBy.toString());
      if (workOrder.assignedTo) userIds.add(workOrder.assignedTo.toString());
      if (workOrder.verifiedBy) userIds.add(workOrder.verifiedBy.toString());
      for (const event of workOrder.events) userIds.add(event.actorId.toString());
      vehicleIds.add(workOrder.vehicleId.toString());
      incidentIds.add(workOrder.incidentId.toString());
    }

    const [users, vehicles, incidents] = await Promise.all([
      UserModel.find({ _id: { $in: [...userIds].map(objectId) } }).select("_id fullName"),
      VehicleModel.find({ _id: { $in: [...vehicleIds].map(objectId) } }).select(
        "_id registrationNumber",
      ),
      VehicleIncidentModel.find({ _id: { $in: [...incidentIds].map(objectId) } }).select(
        "_id category description location",
      ),
    ]);

    return {
      names: new Map(users.map((user) => [user._id.toString(), user.fullName])),
      registrations: new Map(
        vehicles.map((vehicle) => [vehicle._id.toString(), vehicle.registrationNumber]),
      ),
      incidents: new Map(
        incidents.map((incident) => [
          incident._id.toString(),
          {
            category: incident.category,
            description: incident.description,
            location: incident.location,
          },
        ]),
      ),
    };
  }

  private sanitize(
    workOrder: IMaintenanceWorkOrder,
    lookups: Awaited<ReturnType<MaintenanceWorkOrderService["getLookups"]>>,
  ): MaintenanceWorkOrder {
    const incident = lookups.incidents.get(workOrder.incidentId.toString());
    return {
      id: workOrder._id.toString(),
      incidentId: workOrder.incidentId.toString(),
      incidentCategory: incident?.category ?? "other",
      incidentDescription: incident?.description ?? "",
      incidentLocation: incident?.location ?? "",
      vehicleId: workOrder.vehicleId.toString(),
      vehicleRegistration:
        lookups.registrations.get(workOrder.vehicleId.toString()) ?? null,
      driverId: workOrder.driverId.toString(),
      driverName: lookups.names.get(workOrder.driverId.toString()) ?? null,
      assignedToId: workOrder.assignedTo?.toString() ?? null,
      assignedToName: workOrder.assignedTo
        ? lookups.names.get(workOrder.assignedTo.toString()) ?? null
        : null,
      vendorName: workOrder.vendorName ?? "",
      priority: workOrder.priority,
      expectedCompletionAt: workOrder.expectedCompletionAt ?? null,
      vehicleOutOfService: workOrder.vehicleOutOfService,
      status: workOrder.status,
      adminNote: workOrder.adminNote ?? "",
      diagnosis: workOrder.diagnosis ?? "",
      repairNotes: workOrder.repairNotes ?? "",
      partsUsed: workOrder.partsUsed ?? "",
      partsCost: workOrder.partsCost ?? 0,
      laborCost: workOrder.laborCost ?? 0,
      totalCost: (workOrder.partsCost ?? 0) + (workOrder.laborCost ?? 0),
      invoiceUrl: workOrder.invoiceUrl ?? "",
      repairStartedAt: workOrder.repairStartedAt ?? null,
      repairCompletedAt: workOrder.repairCompletedAt ?? null,
      verifiedAt: workOrder.verifiedAt ?? null,
      closedAt: workOrder.closedAt ?? null,
      cancellationReason: workOrder.cancellationReason ?? "",
      events: workOrder.events.map((event) => ({
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        actorId: event.actorId.toString(),
        actorName: lookups.names.get(event.actorId.toString()) ?? null,
        actorRole: event.actorRole,
        note: event.note,
        createdAt: event.createdAt,
      })),
      createdAt: workOrder.createdAt,
      updatedAt: workOrder.updatedAt,
    };
  }

  private async sanitizeOne(workOrder: IMaintenanceWorkOrder) {
    const lookups = await this.getLookups([workOrder]);
    return this.sanitize(workOrder, lookups);
  }

  private recordStatusChange(
    workOrder: IMaintenanceWorkOrder,
    fromStatus: MaintenanceWorkOrderStatus | null,
    toStatus: MaintenanceWorkOrderStatus,
    actorId: string,
    actorRole: "admin" | "maintenance",
    note = "",
  ) {
    workOrder.events.push({
      fromStatus,
      toStatus,
      actorId: objectId(actorId),
      actorRole,
      note: clean(note),
      createdAt: new Date(),
    });
  }

  private async markVehicleForMaintenance(vehicleId: mongoose.Types.ObjectId) {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || vehicle.status === "inactive") return;
    vehicle.status = "maintenance";
    await vehicle.save();
  }

  private async restoreVehicleIfReady(
    vehicleId: mongoose.Types.ObjectId,
    completedWorkOrderId: mongoose.Types.ObjectId,
  ) {
    const remainingWork = await MaintenanceWorkOrderModel.exists({
      vehicleId,
      _id: { $ne: completedWorkOrderId },
      status: { $in: ACTIVE_WORK_ORDER_STATUSES },
      vehicleOutOfService: true,
    });
    if (remainingWork) return;

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || vehicle.status === "inactive") return;

    vehicle.status = vehicle.assignedDriverId ? "assigned" : "available";
    await vehicle.save();
  }

  async listForAdmin({ status, page, limit }: ListParams) {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const [workOrders, total] = await Promise.all([
      MaintenanceWorkOrderModel.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      MaintenanceWorkOrderModel.countDocuments(query),
    ]);
    const lookups = await this.getLookups(workOrders);

    return {
      items: workOrders.map((workOrder) => this.sanitize(workOrder, lookups)),
      total,
    };
  }

  async listForMaintenance(
    maintenanceUserId: string,
    { status, page, limit }: ListParams,
  ) {
    const query: Record<string, unknown> = {
      assignedTo: objectId(maintenanceUserId),
    };
    if (status) query.status = status;

    const [workOrders, total] = await Promise.all([
      MaintenanceWorkOrderModel.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      MaintenanceWorkOrderModel.countDocuments(query),
    ]);
    const lookups = await this.getLookups(workOrders);

    return {
      items: workOrders.map((workOrder) => this.sanitize(workOrder, lookups)),
      total,
    };
  }

  async createForIncident(
    incidentId: string,
    input: CreateMaintenanceWorkOrderDTO,
    adminId: string,
  ) {
    if (!mongoose.isValidObjectId(incidentId)) {
      throw new HttpException(404, "Incident not found");
    }

    const [incident, existing] = await Promise.all([
      VehicleIncidentModel.findById(incidentId),
      MaintenanceWorkOrderModel.findOne({ incidentId: objectId(incidentId) }),
    ]);
    if (!incident) throw new HttpException(404, "Incident not found");
    if (existing) {
      throw new HttpException(409, "This incident already has a maintenance work order");
    }
    if (["closed", "resolved", "rejected"].includes(incident.status)) {
      throw new HttpException(400, "Closed or rejected incidents cannot be sent to maintenance");
    }

    const [maintenanceUser, expectedCompletionAt] = await Promise.all([
      this.getMaintenanceUser(input.maintenanceUserId),
      Promise.resolve(parseOptionalDate(input.expectedCompletionAt)),
    ]);
    const vendorName = clean(input.vendorName);
    if (!maintenanceUser && !vendorName) {
      throw new HttpException(400, "Assign a maintenance user or specify an external workshop");
    }

    const assignedLabel = maintenanceUser
      ? "Assigned to " + maintenanceUser.fullName
      : "Assigned to " + vendorName;
    const workOrder = await MaintenanceWorkOrderModel.create({
      incidentId: incident._id,
      vehicleId: incident.vehicleId,
      driverId: incident.driverId,
      assignedTo: maintenanceUser?._id ?? null,
      vendorName,
      priority: input.priority,
      expectedCompletionAt,
      vehicleOutOfService: input.vehicleOutOfService,
      adminNote: clean(input.adminNote),
      createdBy: objectId(adminId),
      status: "assigned",
      events: [
        {
          fromStatus: null,
          toStatus: "assigned",
          actorId: objectId(adminId),
          actorRole: "admin",
          note: assignedLabel,
          createdAt: new Date(),
        },
      ],
    });

    incident.status = "assigned_to_maintenance";
    incident.maintenanceAction = assignedLabel;
    incident.reviewedAt = incident.reviewedAt ?? new Date();
    incident.reviewedBy = incident.reviewedBy ?? objectId(adminId);
    await incident.save();

    if (workOrder.vehicleOutOfService) {
      await this.markVehicleForMaintenance(workOrder.vehicleId);
    }

    return this.sanitizeOne(workOrder);
  }

  async updateAsAdmin(
    workOrderId: string,
    input: AdminUpdateMaintenanceWorkOrderDTO,
    adminId: string,
  ) {
    if (!mongoose.isValidObjectId(workOrderId)) {
      throw new HttpException(404, "Maintenance work order not found");
    }

    const workOrder = await MaintenanceWorkOrderModel.findById(workOrderId);
    if (!workOrder) throw new HttpException(404, "Maintenance work order not found");

    const incident = await VehicleIncidentModel.findById(workOrder.incidentId);
    if (!incident) throw new HttpException(404, "Linked incident not found");

    if (input.status === "closed") {
      if (workOrder.status !== "awaiting_verification") {
        throw new HttpException(400, "Only completed work can be verified and closed");
      }
      const verificationNote = clean(input.verificationNote);
      if (!verificationNote) {
        throw new HttpException(400, "Verification note is required before closing");
      }

      const now = new Date();
      const previousStatus = workOrder.status;
      workOrder.status = "closed";
      workOrder.verifiedBy = objectId(adminId);
      workOrder.verifiedAt = now;
      workOrder.closedAt = now;
      this.recordStatusChange(
        workOrder,
        previousStatus,
        "closed",
        adminId,
        "admin",
        verificationNote,
      );

      incident.status = "closed";
      incident.resolutionNote = verificationNote;
      incident.resolvedAt = now;
      await Promise.all([workOrder.save(), incident.save()]);
      if (workOrder.vehicleOutOfService) {
        await this.restoreVehicleIfReady(workOrder.vehicleId, workOrder._id);
      }
      return this.sanitizeOne(workOrder);
    }

    if (input.status === "cancelled") {
      if (!ACTIVE_WORK_ORDER_STATUSES.includes(workOrder.status)) {
        throw new HttpException(400, "Only active work orders can be cancelled");
      }
      const cancellationReason = clean(input.cancellationReason);
      if (!cancellationReason) {
        throw new HttpException(400, "Cancellation reason is required");
      }

      const previousStatus = workOrder.status;
      workOrder.status = "cancelled";
      workOrder.cancellationReason = cancellationReason;
      this.recordStatusChange(
        workOrder,
        previousStatus,
        "cancelled",
        adminId,
        "admin",
        cancellationReason,
      );
      incident.status = "maintenance_required";
      incident.maintenanceAction = "Maintenance work order cancelled: reassignment required";
      await Promise.all([workOrder.save(), incident.save()]);
      return this.sanitizeOne(workOrder);
    }

    if (!ACTIVE_WORK_ORDER_STATUSES.includes(workOrder.status)) {
      throw new HttpException(400, "Closed work orders cannot be changed");
    }

    const maintenanceUser =
      input.maintenanceUserId === undefined
        ? undefined
        : await this.getMaintenanceUser(input.maintenanceUserId);
    const vendorName =
      input.vendorName === undefined ? workOrder.vendorName : clean(input.vendorName);
    const assignedTo =
      input.maintenanceUserId === undefined
        ? workOrder.assignedTo
        : maintenanceUser?._id ?? null;
    if (!assignedTo && !vendorName) {
      throw new HttpException(400, "Assign a maintenance user or specify an external workshop");
    }

    if (input.maintenanceUserId !== undefined) workOrder.assignedTo = assignedTo;
    if (input.vendorName !== undefined) workOrder.vendorName = vendorName;
    if (input.priority !== undefined) workOrder.priority = input.priority;
    if (input.expectedCompletionAt !== undefined) {
      workOrder.expectedCompletionAt = parseOptionalDate(input.expectedCompletionAt);
    }
    if (input.vehicleOutOfService !== undefined) {
      workOrder.vehicleOutOfService = input.vehicleOutOfService;
    }
    if (input.adminNote !== undefined) workOrder.adminNote = clean(input.adminNote);

    const assignmentChanged =
      input.maintenanceUserId !== undefined || input.vendorName !== undefined;
    if (assignmentChanged || input.adminNote !== undefined) {
      const target = workOrder.assignedTo
        ? "Assigned to " + (maintenanceUser?.fullName ?? "maintenance team")
        : "Assigned to " + workOrder.vendorName;
      this.recordStatusChange(
        workOrder,
        workOrder.status,
        workOrder.status,
        adminId,
        "admin",
        input.adminNote ? clean(input.adminNote) : target,
      );
      incident.maintenanceAction = target;
      await incident.save();
    }

    await workOrder.save();
    if (workOrder.vehicleOutOfService) {
      await this.markVehicleForMaintenance(workOrder.vehicleId);
    }

    return this.sanitizeOne(workOrder);
  }

  async updateAsMaintenance(
    workOrderId: string,
    input: MaintenanceWorkOrderUpdateDTO,
    maintenanceUserId: string,
  ) {
    if (!mongoose.isValidObjectId(workOrderId)) {
      throw new HttpException(404, "Maintenance work order not found");
    }

    const workOrder = await MaintenanceWorkOrderModel.findById(workOrderId);
    if (!workOrder) throw new HttpException(404, "Maintenance work order not found");
    if (workOrder.assignedTo?.toString() !== maintenanceUserId) {
      throw new HttpException(403, "This work order is not assigned to you");
    }
    if (!ACTIVE_WORK_ORDER_STATUSES.includes(workOrder.status)) {
      throw new HttpException(400, "Closed work orders cannot be changed");
    }

    if (input.diagnosis !== undefined) workOrder.diagnosis = clean(input.diagnosis);
    if (input.repairNotes !== undefined) workOrder.repairNotes = clean(input.repairNotes);
    if (input.partsUsed !== undefined) workOrder.partsUsed = clean(input.partsUsed);
    if (input.partsCost !== undefined) workOrder.partsCost = input.partsCost;
    if (input.laborCost !== undefined) workOrder.laborCost = input.laborCost;
    if (input.invoiceUrl !== undefined) workOrder.invoiceUrl = clean(input.invoiceUrl);

    const now = new Date();
    if (input.status === "in_repair") {
      if (!["assigned", "in_repair"].includes(workOrder.status)) {
        throw new HttpException(400, "Only assigned work can be started");
      }
      const previousStatus = workOrder.status;
      workOrder.status = "in_repair";
      workOrder.repairStartedAt = workOrder.repairStartedAt ?? now;
      this.recordStatusChange(
        workOrder,
        previousStatus,
        "in_repair",
        maintenanceUserId,
        "maintenance",
        input.activityNote || "Repair started",
      );
      const incident = await VehicleIncidentModel.findById(workOrder.incidentId);
      if (incident) {
        incident.status = "in_repair";
        await incident.save();
      }
    } else if (input.status === "awaiting_verification") {
      if (workOrder.status !== "in_repair") {
        throw new HttpException(400, "Start the repair before submitting it for verification");
      }
      if (!workOrder.diagnosis || !workOrder.repairNotes) {
        throw new HttpException(400, "Diagnosis and repair notes are required before verification");
      }

      workOrder.status = "awaiting_verification";
      workOrder.repairCompletedAt = now;
      this.recordStatusChange(
        workOrder,
        "in_repair",
        "awaiting_verification",
        maintenanceUserId,
        "maintenance",
        input.activityNote || "Repair completed and ready for verification",
      );
      const incident = await VehicleIncidentModel.findById(workOrder.incidentId);
      if (incident) {
        incident.status = "awaiting_verification";
        await incident.save();
      }
    } else if (input.activityNote) {
      this.recordStatusChange(
        workOrder,
        workOrder.status,
        workOrder.status,
        maintenanceUserId,
        "maintenance",
        input.activityNote,
      );
    }

    await workOrder.save();
    return this.sanitizeOne(workOrder);
  }
}