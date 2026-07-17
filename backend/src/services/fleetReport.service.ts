import mongoose from "mongoose";
import { HttpException } from "../exceptions/http-exception";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";
import {
  VehicleIncidentModel,
  type IVehicleIncident,
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
import { VehicleService } from "./vehicle.service";

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
  reviewedBy: string | null;
  reviewedAt: Date | null;
  resolvedAt: Date | null;
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

function trimmed(value?: string): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

function objectId(value: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(value);
}

export class FleetReportService {
  private readonly vehicleService = new VehicleService();

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
      names: new Map(drivers.map((driver) => [driver._id.toString(), driver.fullName])),
      regs: new Map(
        vehicles.map((vehicle) => [
          vehicle._id.toString(),
          vehicle.registrationNumber,
        ]),
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
      reviewedBy: incident.reviewedBy?.toString() ?? null,
      reviewedAt: incident.reviewedAt ?? null,
      resolvedAt: incident.resolvedAt ?? null,
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
      incidents.map((incident) => incident.driverId),
      incidents.map((incident) => incident.vehicleId),
    );

    return {
      items: incidents.map((incident) =>
        this.sanitizeIncident(incident, names, regs),
      ),
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
    if (incident.status !== "pending_review") {
      throw new HttpException(409, "This issue report has already been reviewed");
    }

    if (input.decision === "maintenance_required") {
      await this.vehicleService.markMaintenanceRequired(
        incident.vehicleId.toString(),
      );
      incident.status = "maintenance_required";
      incident.resolvedAt = null;
    } else {
      incident.status = "resolved";
      incident.resolvedAt = new Date();
    }

    incident.adminNote = input.adminNote?.trim() ?? "";
    incident.reviewedBy = objectId(adminId);
    incident.reviewedAt = new Date();
    await incident.save();

    const { names, regs } = await this.buildLookups(
      [incident.driverId],
      [incident.vehicleId],
    );
    return this.sanitizeIncident(incident, names, regs);
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
      expenses.map((expense) => expense.driverId),
      expenses.map((expense) => expense.vehicleId),
    );

    return {
      items: expenses.map((expense) =>
        this.sanitizeFuelExpense(expense, names, regs),
      ),
      total,
    };
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
    const rejectionReason =
      trimmed(input.rejectionReason) ?? expense.rejectionReason;
    const paymentReference =
      trimmed(input.paymentReference) ?? expense.paymentReference;

    if (nextStatus === "rejected" && !rejectionReason?.trim()) {
      throw new HttpException(400, "Rejection reason is required");
    }
    if (nextStatus === "reimbursed") {
      if (expense.status !== "approved" && expense.status !== "reimbursed") {
        throw new HttpException(
          400,
          "Approve the fuel expense before reimbursement",
        );
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
    pendingIncidents: number;
    pendingFuelExpenses: number;
    approvedFuelExpenses: number;
  }> {
    const [pendingIncidents, pendingFuelExpenses, approvedFuelExpenses] =
      await Promise.all([
        VehicleIncidentModel.countDocuments({ status: "pending_review" }),
        VehicleFuelExpenseModel.countDocuments({
          status: { $in: ["submitted", "under_review"] },
        }),
        VehicleFuelExpenseModel.countDocuments({ status: "approved" }),
      ]);
    return { pendingIncidents, pendingFuelExpenses, approvedFuelExpenses };
  }
}
