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
} from "../models/vehicleFuelExpense.model";
import type { IncidentStatusDTO, FuelExpenseStatusDTO } from "../dtos/fleetReport.dto";

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
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type ListParams = {
  status?: string;
  vehicleId?: string;
  page: number;
  limit: number;
};

export class FleetReportService {
  // Resolve driver names and vehicle registrations for a batch of records in
  // two queries, mirroring VehicleService.withDriverNames.
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
      status: expense.status,
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

  async updateIncidentStatus(
    id: string,
    input: IncidentStatusDTO,
  ): Promise<AdminIncident> {
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpException(404, "Incident not found");
    }
    const incident = await VehicleIncidentModel.findByIdAndUpdate(
      id,
      { status: input.status },
      { new: true },
    );
    if (!incident) throw new HttpException(404, "Incident not found");

    const { names, regs } = await this.buildLookups(
      [incident.driverId],
      [incident.vehicleId],
    );
    return this.sanitizeIncident(incident, names, regs);
  }

  async updateFuelExpenseStatus(
    id: string,
    input: FuelExpenseStatusDTO,
  ): Promise<AdminFuelExpense> {
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpException(404, "Fuel expense not found");
    }
    const expense = await VehicleFuelExpenseModel.findByIdAndUpdate(
      id,
      { status: input.status },
      { new: true },
    );
    if (!expense) throw new HttpException(404, "Fuel expense not found");

    const { names, regs } = await this.buildLookups(
      [expense.driverId],
      [expense.vehicleId],
    );
    return this.sanitizeFuelExpense(expense, names, regs);
  }

  async getStats(): Promise<{ openIncidents: number; pendingFuelExpenses: number }> {
    const [openIncidents, pendingFuelExpenses] = await Promise.all([
      VehicleIncidentModel.countDocuments({ status: "open" }),
      VehicleFuelExpenseModel.countDocuments({ status: "submitted" }),
    ]);
    return { openIncidents, pendingFuelExpenses };
  }
}
