import mongoose from "mongoose";
import {
  IVehicle,
  VehicleModel,
  VehicleStatus,
} from "../models/vehicle.model";
import { UserModel } from "../models/user.model";
import { ShipmentModel } from "../models/shipment.model";
import { WarehouseModel } from "../models/warehouse.model";
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
  warehouseId: string | null;
  warehouseName: string | null;
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
    // An empty warehouse selection means "no home hub" — store null so Mongoose
    // does not try to cast "" to an ObjectId.
    if (data.warehouseId === "") {
      data.warehouseId = null;
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
    warehouseName: string | null = null,
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
      warehouseId: vehicle.warehouseId?.toString() ?? null,
      warehouseName,
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
    const warehouseIds = vehicles
      .map((vehicle) => vehicle.warehouseId)
      .filter((id): id is mongoose.Types.ObjectId => !!id);

    const [drivers, warehouses] = await Promise.all([
      UserModel.find({ _id: { $in: driverIds } }).select("_id fullName"),
      WarehouseModel.find({ _id: { $in: warehouseIds } }).select("_id name"),
    ]);

    const names = new Map(
      drivers.map((driver) => [driver._id.toString(), driver.fullName]),
    );
    const warehouseNames = new Map(
      warehouses.map((warehouse) => [
        warehouse._id.toString(),
        warehouse.name,
      ]),
    );

    return vehicles.map((vehicle) =>
      this.sanitize(
        vehicle,
        vehicle.assignedDriverId
          ? names.get(vehicle.assignedDriverId.toString()) ?? null
          : null,
        vehicle.warehouseId
          ? warehouseNames.get(vehicle.warehouseId.toString()) ?? null
          : null,
      ),
    );
  }

  async getVehicles(
    page: number,
    limit: number,
    search = "",
    status?: VehicleStatus,
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
        .sort({ createdAt: -1 })
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
    const [total, available, assigned, maintenance, inactive] =
      await Promise.all([
        VehicleModel.countDocuments(),
        VehicleModel.countDocuments({ status: "available" }),
        VehicleModel.countDocuments({ status: "assigned" }),
        VehicleModel.countDocuments({ status: "maintenance" }),
        VehicleModel.countDocuments({ status: "inactive" }),
      ]);
    return { total, available, assigned, maintenance, inactive };
  }

  async createVehicle(input: AdminCreateVehicleDTO): Promise<SafeVehicle> {
    const registrationNumber = input.registrationNumber.trim().toUpperCase();
    const existing = await VehicleModel.findOne({ registrationNumber });
    if (existing) {
      throw new HttpException(400, "Vehicle registration already exists");
    }
    if (input.status === "assigned") {
      throw new HttpException(
        400,
        "Assign a driver after creating the vehicle",
      );
    }

    const vehicle = await VehicleModel.create({
      ...this.normalizeInput(input),
      registrationNumber,
    });
    const [safeVehicle] = await this.withDriverNames([vehicle]);
    return safeVehicle;
  }

  async updateVehicle(
    id: string,
    input: AdminUpdateVehicleDTO,
  ): Promise<SafeVehicle> {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");

    if (
      input.status &&
      ["maintenance", "inactive"].includes(input.status) &&
      vehicle.assignedDriverId
    ) {
      throw new HttpException(
        400,
        "Unassign the driver before changing this vehicle status",
      );
    }
    if (input.status === "assigned" && !vehicle.assignedDriverId) {
      throw new HttpException(400, "Use vehicle assignment to set a driver");
    }

    vehicle.set(this.normalizeInput(input));
    await vehicle.save();
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

  private async closeCurrentAssignment(vehicle: IVehicle) {
    for (let i = vehicle.assignmentHistory.length - 1; i >= 0; i -= 1) {
      if (!vehicle.assignmentHistory[i].unassignedAt) {
        vehicle.assignmentHistory[i].unassignedAt = new Date();
        break;
      }
    }
  }

  async assignDriver(
    vehicleId: string,
    driverId: string | null,
  ): Promise<SafeVehicle> {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) throw new HttpException(404, "Vehicle not found");

    const currentDriverId = vehicle.assignedDriverId?.toString() ?? null;
    if (currentDriverId === driverId) {
      const [safeVehicle] = await this.withDriverNames([vehicle]);
      return safeVehicle;
    }

    const driver = driverId ? await UserModel.findById(driverId) : null;
    if (driverId) {
      if (!["available", "assigned"].includes(vehicle.status)) {
        throw new HttpException(
          400,
          "Only available vehicles can be assigned",
        );
      }

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

    if (currentDriverId) {
      await this.closeCurrentAssignment(vehicle);
      vehicle.assignedDriverId = null;
      vehicle.status = "available";
    }

    if (driver) {
      vehicle.assignedDriverId = driver._id;
      vehicle.status = "assigned";
      vehicle.assignmentHistory.push({
        driverId: driver._id,
        assignedAt: new Date(),
        unassignedAt: null,
      });
    }

    await vehicle.save();
    await Promise.all([
      currentDriverId
        ? UserModel.findByIdAndUpdate(currentDriverId, {
            assignedVehicleId: null,
          })
        : Promise.resolve(),
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
}
