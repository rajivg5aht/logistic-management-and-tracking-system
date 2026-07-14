import mongoose from "mongoose";
import { HttpException } from "../exceptions/http-exception";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";
import {
  VehicleIncidentModel,
  type IVehicleIncident,
  type VehicleIncidentStatus,
} from "../models/vehicleIncident.model";
import {
  VehicleFuelExpenseModel,
  type IVehicleFuelExpense,
  type VehicleFuelExpenseStatus,
} from "../models/vehicleFuelExpense.model";
import type {
  AdminIncidentUpdateDTO,
  AdminFuelExpenseUpdateDTO,
} from "../dtos/fleetReport.dto";

export type AdminIncident = {
  id: string;
  vehicleId: string;
  vehicleRegistration: string | null;
  driverId: string;
  driverName: string | null;
  category: string;
  severity: string;
  description: string;
  location: string;
  status: string;
  adminNote: string;
  resolutionNote: string;
  rejectionReason: string;
  maintenanceAction: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  resolvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminFuelExpense = {
  id: string;
  vehicleId: string;
  vehicleRegistration: string | null;
  driverId: string;
  driverName: string | null;
  fuelType: string;
  liters?: number;
  amount: number;
  odometerKm: number;
  stationName: string;
  notes: string;
  receiptUrl: string;
  status: string;
  adminNote: string;
  rejectionReason: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  reimbursedBy: string | null;
  reimbursedAt: Date | null;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
};

type ListParams = {
  status?: string;
  vehicleId?: string;
  page: number;
  limit: number;
};

const ACTIVE_INCIDENT_STATUSES: VehicleIncidentStatus[] = [
  "open",
  "reviewing",
  "maintenance_required",
  "in_repair",
];

function trimmed(value?: string): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

function objectId(value: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(value);
}

export class FleetReportService {
  private async buildLookups(
    driverIds: mongoose.Types.ObjectId[],
    vehicleIds: mongoose.Types.ObjectId[],
  ): Promise<{ names: Map<string, string>; regs: Map<string, string> }> {
    const [drivers, vehicles] = await Promise.all([
      UserModel.find({ _id: { $in: driverIds } }).select("_id fullName"),
      VehicleModel.find({ _id: { $in: vehicleIds } }).select(
        "_id registrationNumber",
      ),
    ]);
    return {
      names: new Map(drivers.map((d) => [d._id.toString(), d.fullName])),
      regs: new Map(
        vehicles.map((v) => [v._id.toString(), v.registrationNumber]),
      ),
    };
  }

  private sanitizeIncident(
    incident: IVehicleIncident,
    names: Map<string, string>,
    regs: Map<string, string>,
  ): AdminIncident {
    return {
      id: incident._id.toString(),
      vehicleId: incident.vehicleId.toString(),
      vehicleRegistration: regs.get(incident.vehicleId.toString()) ?? null,
      driverId: incident.driverId.toString(),
      driverName: names.get(incident.driverId.toString()) ?? null,
      category: incident.category,
      severity: incident.severity,
      description: incident.description,
      location: incident.location,
      status: incident.status,
      adminNote: incident.adminNote ?? "",
      resolutionNote: incident.resolutionNote ?? "",
      rejectionReason: incident.rejectionReason ?? "",
      maintenanceAction: incident.maintenanceAction ?? "",
      reviewedBy: incident.reviewedBy?.toString() ?? null,
      reviewedAt: incident.reviewedAt ?? null,
      resolvedAt: incident.resolvedAt ?? null,
      rejectedAt: incident.rejectedAt ?? null,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    };
  }

  private sanitizeFuelExpense(
    expense: IVehicleFuelExpense,
    names: Map<string, string>,
    regs: Map<string, string>,
  ): AdminFuelExpense {
    return {
      id: expense._id.toString(),
      vehicleId: expense.vehicleId.toString(),
      vehicleRegistration: regs.get(expense.vehicleId.toString()) ?? null,
      driverId: expense.driverId.toString(),
      driverName: names.get(expense.driverId.toString()) ?? null,
      fuelType: expense.fuelType,
      liters: expense.liters,
      amount: expense.amount,
      odometerKm: expense.odometerKm,
      stationName: expense.stationName,
      notes: expense.notes,
      receiptUrl: expense.receiptUrl ?? "",
      status: expense.status,
      adminNote: expense.adminNote ?? "",
      rejectionReason: expense.rejectionReason ?? "",
      approvedBy: expense.approvedBy?.toString() ?? null,
      approvedAt: expense.approvedAt ?? null,
      reimbursedBy: expense.reimbursedBy?.toString() ?? null,
      reimbursedAt: expense.reimbursedAt ?? null,
      paymentReference: expense.paymentReference ?? "",
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  private buildQuery(status?: string, vehicleId?: string): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (vehicleId && mongoose.isValidObjectId(vehicleId)) {
      query.vehicleId = new mongoose.Types.ObjectId(vehicleId);
    }
    return query;
  }

  private async markVehicleForMaintenance(vehicleId: mongoose.Types.ObjectId) {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || vehicle.status === "inactive") return;
    vehicle.status = "maintenance";
    await vehicle.save();
  }

  async listIncidents({
    status,
    vehicleId,
    page,
    limit,
  }: ListParams): Promise<{ items: AdminIncident[]; total: number }> {
    const query = this.buildQuery(status, vehicleId);
    const [incidents, total] = await Promise.all([
      VehicleIncidentModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      VehicleIncidentModel.countDocuments(query),
    ]);

    const { names, regs } = await this.buildLookups(
      incidents.map((i) => i.driverId),
      incidents.map((i) => i.vehicleId),
    );

    return {
      items: incidents.map((i) => this.sanitizeIncident(i, names, regs)),
      total,
    };
  }

  async listFuelExpenses({
    status,
    vehicleId,
    page,
    limit,
  }: ListParams): Promise<{ items: AdminFuelExpense[]; total: number }> {
    const query = this.buildQuery(status, vehicleId);
    const [expenses, total] = await Promise.all([
      VehicleFuelExpenseModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      VehicleFuelExpenseModel.countDocuments(query),
    ]);

    const { names, regs } = await this.buildLookups(
      expenses.map((e) => e.driverId),
      expenses.map((e) => e.vehicleId),
    );

    return {
      items: expenses.map((e) => this.sanitizeFuelExpense(e, names, regs)),
      total,
    };
  }

  async updateIncident(
    id: string,
    input: AdminIncidentUpdateDTO,
    adminId: string,
  ): Promise<AdminIncident> {
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpException(404, "Incident not found");
    }

    const incident = await VehicleIncidentModel.findById(id);
    if (!incident) throw new HttpException(404, "Incident not found");

    const nextStatus = input.status as VehicleIncidentStatus | undefined;
    const resolutionNote = trimmed(input.resolutionNote) ?? incident.resolutionNote;
    const rejectionReason = trimmed(input.rejectionReason) ?? incident.rejectionReason;

    if (nextStatus === "resolved" && !resolutionNote?.trim()) {
      throw new HttpException(400, "Resolution note is required");
    }
    if (nextStatus === "rejected" && !rejectionReason?.trim()) {
      throw new HttpException(400, "Rejection reason is required");
    }

    if (input.adminNote !== undefined) incident.adminNote = input.adminNote;
    if (input.resolutionNote !== undefined) {
      incident.resolutionNote = input.resolutionNote;
    }
    if (input.rejectionReason !== undefined) {
      incident.rejectionReason = input.rejectionReason;
    }
    if (input.maintenanceAction !== undefined) {
      incident.maintenanceAction = input.maintenanceAction;
    }

    if (nextStatus) {
      const now = new Date();
      incident.status = nextStatus;

      if (nextStatus !== "open" && !incident.reviewedAt) {
        incident.reviewedAt = now;
        incident.reviewedBy = objectId(adminId);
      }
      if (nextStatus === "resolved") {
        incident.resolvedAt = now;
        incident.rejectedAt = null;
      } else if (nextStatus === "rejected") {
        incident.rejectedAt = now;
        incident.resolvedAt = null;
      } else if (ACTIVE_INCIDENT_STATUSES.includes(nextStatus)) {
        incident.resolvedAt = null;
        incident.rejectedAt = null;
      }
    }

    if (
      incident.status === "maintenance_required" ||
      incident.status === "in_repair" ||
      (incident.status !== "resolved" && incident.severity === "critical")
    ) {
      await this.markVehicleForMaintenance(incident.vehicleId);
    }

    await incident.save();

    const { names, regs } = await this.buildLookups(
      [incident.driverId],
      [incident.vehicleId],
    );
    return this.sanitizeIncident(incident, names, regs);
  }

  async updateFuelExpense(
    id: string,
    input: AdminFuelExpenseUpdateDTO,
    adminId: string,
  ): Promise<AdminFuelExpense> {
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpException(404, "Fuel expense not found");
    }

    const expense = await VehicleFuelExpenseModel.findById(id);
    if (!expense) throw new HttpException(404, "Fuel expense not found");

    const nextStatus = input.status as VehicleFuelExpenseStatus | undefined;
    const rejectionReason = trimmed(input.rejectionReason) ?? expense.rejectionReason;
    const paymentReference = trimmed(input.paymentReference) ?? expense.paymentReference;

    if (nextStatus === "rejected" && !rejectionReason?.trim()) {
      throw new HttpException(400, "Rejection reason is required");
    }
    if (nextStatus === "reimbursed") {
      if (expense.status !== "approved" && expense.status !== "reimbursed") {
        throw new HttpException(400, "Approve the fuel expense before reimbursement");
      }
      if (!paymentReference?.trim()) {
        throw new HttpException(400, "Payment reference is required");
      }
    }

    if (input.adminNote !== undefined) expense.adminNote = input.adminNote;
    if (input.rejectionReason !== undefined) {
      expense.rejectionReason = input.rejectionReason;
    }
    if (input.paymentReference !== undefined) {
      expense.paymentReference = input.paymentReference;
    }

    if (nextStatus) {
      const now = new Date();
      expense.status = nextStatus;

      if (nextStatus === "approved") {
        expense.approvedBy = objectId(adminId);
        expense.approvedAt = expense.approvedAt ?? now;
        expense.reimbursedBy = null;
        expense.reimbursedAt = null;
      } else if (nextStatus === "reimbursed") {
        expense.reimbursedBy = objectId(adminId);
        expense.reimbursedAt = expense.reimbursedAt ?? now;
      } else if (nextStatus === "rejected") {
        expense.approvedBy = null;
        expense.approvedAt = null;
        expense.reimbursedBy = null;
        expense.reimbursedAt = null;
      }
    }

    await expense.save();

    const { names, regs } = await this.buildLookups(
      [expense.driverId],
      [expense.vehicleId],
    );
    return this.sanitizeFuelExpense(expense, names, regs);
  }

  async getStats(): Promise<{
    openIncidents: number;
    pendingFuelExpenses: number;
    approvedFuelExpenses: number;
  }> {
    const [openIncidents, pendingFuelExpenses, approvedFuelExpenses] =
      await Promise.all([
        VehicleIncidentModel.countDocuments({
          status: { $in: ACTIVE_INCIDENT_STATUSES },
        }),
        VehicleFuelExpenseModel.countDocuments({
          status: { $in: ["submitted", "under_review"] },
        }),
        VehicleFuelExpenseModel.countDocuments({ status: "approved" }),
      ]);
    return { openIncidents, pendingFuelExpenses, approvedFuelExpenses };
  }
}
