import mongoose from "mongoose";
import {
  IVehicle,
  VehicleModel,
  VehicleStatus,
} from "../models/vehicle.model";
import { UserModel } from "../models/user.model";
import { ShipmentModel } from "../models/shipment.model";
import {
  AdminCreateVehicleDTO,
  AdminUpdateVehicleDTO,
} from "../dtos/vehicle.dto";
import { HttpException } from "../exceptions/http-exception";

type VehicleInput = AdminCreateVehicleDTO | AdminUpdateVehicleDTO;

export type SafeVehicle = {
  id: string;
  registrationNumber: string;
  type: IVehicle["type"];
  make: string;
  model: string;
  year?: number;
  capacityKg?: number;
  branch: string;
  imageUrl: string | null;
  status: VehicleStatus;
  insuranceExpiry: Date | null;
  registrationExpiry: Date | null;
  lastServiceAt: Date | null;
  nextServiceAt: Date | null;
  odometerKm: number;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignmentHistory: Array<{
    driverId: string;
    assignedAt: Date;
    unassignedAt: Date | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
};
export type VehicleSort = {
  field: "createdAt" | "updatedAt" | "registrationNumber" | "odometerKm";
  direction: "asc" | "desc";
};


const DATE_FIELDS = [
  "insuranceExpiry",
  "registrationExpiry",
  "lastServiceAt",
  "nextServiceAt",
] as const;

export class VehicleService {
  private normalizeInput(input: VehicleInput): Record<string, unknown> {
    const data: Record<string, unknown> = { ...input };
    if ("model" in data) {
      data.vehicleModel = data.model;
      delete data.model;
    }
    for (const field of DATE_FIELDS) {
      if (field in data) {
        data[field] = data[field] ? new Date(data[field] as string) : null;
      }
    }
    return data;
  }

  private sanitize(
    vehicle: IVehicle,
    driverName: string | null = null,
  ): SafeVehicle {
    return {
      id: vehicle._id.toString(),
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.vehicleModel,
      year: vehicle.year,
      capacityKg: vehicle.capacityKg,
      branch: vehicle.branch,
      imageUrl: vehicle.imageUrl ?? null,
      status: vehicle.status,
      insuranceExpiry: vehicle.insuranceExpiry,
      registrationExpiry: vehicle.registrationExpiry,
      lastServiceAt: vehicle.lastServiceAt,
      nextServiceAt: vehicle.nextServiceAt,
      odometerKm: vehicle.odometerKm,
      assignedDriverId: vehicle.assignedDriverId?.toString() ?? null,
      assignedDriverName: driverName,
      assignmentHistory: vehicle.assignmentHistory.map((entry) => ({
        driverId: entry.driverId.toString(),
        assignedAt: entry.assignedAt,
        unassignedAt: entry.unassignedAt ?? null,
      })),
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  private async withDriverNames(vehicles: IVehicle[]): Promise<SafeVehicle[]> {
    const driverIds = vehicles
      .map((vehicle) => vehicle.assignedDriverId)
      .filter((id): id is mongoose.Types.ObjectId => !!id);
    const drivers = await UserModel.find({ _id: { $in: driverIds } }).select(
      "_id fullName",
    );
    const names = new Map(
      drivers.map((driver) => [driver._id.toString(), driver.fullName]),
    );
    return vehicles.map((vehicle) =>
      this.sanitize(
        vehicle,
        vehicle.assignedDriverId
          ? names.get(vehicle.assignedDriverId.toString()) ?? null
          : null,
      ),
    );
  }

  async getVehicles(
    page: number,
    limit: number,
    search = "",
    status?: VehicleStatus,
    sort: VehicleSort = { field: "createdAt", direction: "desc" },
  ): Promise<{ vehicles: SafeVehicle[]; total: number }> {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: "i" } },
        { make: { $regex: search, $options: "i" } },
        { vehicleModel: { $regex: search, $options: "i" } },
        { branch: { $regex: search, $options: "i" } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      VehicleModel.find(query)
        .sort({ [sort.field]: sort.direction === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      VehicleModel.countDocuments(query),
    ]);

    return { vehicles: await this.withDriverNames(vehicles), total };
  }

  async getVehicleById(id: string): Promise<SafeVehicle> {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");
    const [safeVehicle] = await this.withDriverNames([vehicle]);
    return safeVehicle;
  }

  async getStats() {
    const [total, available, active, maintenanceRequired, inactive] =
      await Promise.all([
        VehicleModel.countDocuments(),
        VehicleModel.countDocuments({ status: "available" }),
        VehicleModel.countDocuments({ status: "active" }),
        VehicleModel.countDocuments({ status: "maintenance_required" }),
        VehicleModel.countDocuments({ status: "inactive" }),
      ]);
    return { total, available, active, maintenanceRequired, inactive };
  }

  async createVehicle(input: AdminCreateVehicleDTO): Promise<SafeVehicle> {
    const registrationNumber = input.registrationNumber.trim().toUpperCase();
    const existing = await VehicleModel.findOne({ registrationNumber });
    if (existing) {
      throw new HttpException(400, "Vehicle registration already exists");
    }
    if (input.status === "active") {
      throw new HttpException(
        400,
        "Assign a driver after creating the vehicle",
      );
    }

    const vehicle = await VehicleModel.create({
      ...this.normalizeInput(input),
      registrationNumber,
    });
    return this.sanitize(vehicle);
  }

  private closeCurrentAssignment(vehicle: IVehicle) {
    for (let index = vehicle.assignmentHistory.length - 1; index >= 0; index -= 1) {
      if (!vehicle.assignmentHistory[index].unassignedAt) {
        vehicle.assignmentHistory[index].unassignedAt = new Date();
        break;
      }
    }
  }

  private detachDriver(vehicle: IVehicle): string | null {
    const driverId = vehicle.assignedDriverId?.toString() ?? null;
    if (!driverId) return null;
    this.closeCurrentAssignment(vehicle);
    vehicle.assignedDriverId = null;
    return driverId;
  }

  private async clearDriverVehicle(driverId: string | null, vehicleId: string) {
    if (!driverId) return;
    await UserModel.updateOne(
      { _id: driverId, assignedVehicleId: vehicleId },
      { $set: { assignedVehicleId: null } },
    );
  }

  async markMaintenanceRequired(vehicleId: string): Promise<SafeVehicle> {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");
    if (vehicle.status === "inactive") {
      throw new HttpException(400, "Inactive vehicles cannot enter maintenance");
    }

    const releasedDriverId = this.detachDriver(vehicle);
    vehicle.status = "maintenance_required";
    await vehicle.save();
    await this.clearDriverVehicle(releasedDriverId, vehicle._id.toString());
    return this.sanitize(vehicle);
  }

  async updateVehicle(
    id: string,
    input: AdminUpdateVehicleDTO,
  ): Promise<SafeVehicle> {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");

    if (input.status === "active" && !vehicle.assignedDriverId) {
      throw new HttpException(400, "Use vehicle assignment to set a driver");
    }
    if (input.status === "available" && vehicle.assignedDriverId) {
      throw new HttpException(
        400,
        "Unassign the driver before making this vehicle available",
      );
    }
    if (input.status === "inactive" && vehicle.assignedDriverId) {
      throw new HttpException(
        400,
        "Unassign the driver before deactivating this vehicle",
      );
    }

    const releasedDriverId =
      input.status === "maintenance_required" ||
      vehicle.status === "maintenance_required"
        ? this.detachDriver(vehicle)
        : null;
    vehicle.set(this.normalizeInput(input));
    await vehicle.save();
    await this.clearDriverVehicle(releasedDriverId, vehicle._id.toString());
    const [safeVehicle] = await this.withDriverNames([vehicle]);
    return safeVehicle;
  }

  async setVehicleImage(id: string, imageUrl: string): Promise<SafeVehicle> {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");
    vehicle.imageUrl = imageUrl;
    await vehicle.save();
    const [safeVehicle] = await this.withDriverNames([vehicle]);
    return safeVehicle;
  }

  async assignDriver(
    vehicleId: string,
    driverId: string | null,
  ): Promise<SafeVehicle> {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");

    const currentDriverId = vehicle.assignedDriverId?.toString() ?? null;
    if (driverId && !["available", "active"].includes(vehicle.status)) {
      throw new HttpException(400, "Only available vehicles can be assigned");
    }
    if (currentDriverId === driverId) {
      const [safeVehicle] = await this.withDriverNames([vehicle]);
      return safeVehicle;
    }

    const driver = driverId ? await UserModel.findById(driverId) : null;
    if (driverId) {
      if (!driver || driver.role !== "driver") {
        throw new HttpException(404, "Driver not found");
      }
      if (driver.status !== "active") {
        throw new HttpException(400, "Inactive drivers cannot receive vehicles");
      }
      if (!driver.phoneNumber || !driver.licenseNumber) {
        throw new HttpException(
          400,
          "Complete the driver's phone and license details before assignment",
        );
      }
      if (
        driver.assignedVehicleId &&
        driver.assignedVehicleId.toString() !== vehicleId
      ) {
        throw new HttpException(
          400,
          "This driver is already assigned to another vehicle",
        );
      }
      const otherVehicle = await VehicleModel.findOne({
        _id: { $ne: vehicle._id },
        assignedDriverId: driver._id,
      });
      if (otherVehicle) {
        throw new HttpException(
          400,
          "This driver is already assigned to another vehicle",
        );
      }

    }

    const releasedDriverId = this.detachDriver(vehicle);

    if (driver) {
      vehicle.assignedDriverId = driver._id;
      vehicle.status = "active";
      vehicle.assignmentHistory.push({
        driverId: driver._id,
        assignedAt: new Date(),
        unassignedAt: null,
      });
    } else {
      vehicle.status = "available";
    }

    await vehicle.save();
    await Promise.all([
      this.clearDriverVehicle(releasedDriverId, vehicle._id.toString()),
      driver
        ? UserModel.findByIdAndUpdate(driver._id, {
            assignedVehicleId: vehicle._id,
          })
        : Promise.resolve(),
    ]);
    const [safeVehicle] = await this.withDriverNames([vehicle]);
    return safeVehicle;
  }

  async deactivateVehicle(id: string): Promise<void> {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");
    if (vehicle.assignedDriverId) {
      throw new HttpException(
        400,
        "Unassign the driver before deactivating this vehicle",
      );
    }
    const activeShipments = await ShipmentModel.countDocuments({
      assignedVehicleId: vehicle._id,
      status: { $nin: ["delivered", "cancelled"] },
    });
    if (activeShipments > 0) {
      throw new HttpException(
        400,
        "Vehicle has active shipments and cannot be deactivated",
      );
    }
    vehicle.status = "inactive";
    await vehicle.save();
  }

  async removeVehicle(id: string): Promise<void> {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");
    if (vehicle.assignedDriverId) {
      throw new HttpException(
        400,
        "Unassign the driver before removing this vehicle",
      );
    }
    const activeShipments = await ShipmentModel.countDocuments({
      assignedVehicleId: vehicle._id,
      status: { $nin: ["delivered", "cancelled"] },
    });
    if (activeShipments > 0) {
      throw new HttpException(
        400,
        "Vehicle has active shipments and cannot be removed",
      );
    }
    await VehicleModel.findByIdAndDelete(id);
  }
}
