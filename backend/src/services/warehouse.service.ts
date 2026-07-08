import mongoose from "mongoose";
import {
  IWarehouse,
  WarehouseModel,
  WarehouseStatus,
} from "../models/warehouse.model";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";
import { ShipmentModel } from "../models/shipment.model";
import {
  AdminCreateWarehouseDTO,
  AdminUpdateWarehouseDTO,
} from "../dtos/warehouse.dto";
import { HttpException } from "../exceptions/http-exception";

export type SafeWarehouse = {
  id: string;
  name: string;
  code: string;
  streetAddress: string;
  city: string;
  district: string;
  contactPhone: string;
  managerName: string;
  capacity: number;
  status: WarehouseStatus;
  driverCount: number;
  vehicleCount: number;
  currentLoad: number; // active shipments routed through this warehouse
  createdAt: Date;
  updatedAt: Date;
};

export type WarehouseOption = { id: string; name: string; code: string };

type WarehouseMetrics = {
  driverCount: number;
  vehicleCount: number;
  currentLoad: number;
};

export class WarehouseService {
  private sanitize(
    warehouse: IWarehouse,
    metrics: WarehouseMetrics = {
      driverCount: 0,
      vehicleCount: 0,
      currentLoad: 0,
    },
  ): SafeWarehouse {
    return {
      id: warehouse._id.toString(),
      name: warehouse.name,
      code: warehouse.code,
      streetAddress: warehouse.streetAddress,
      city: warehouse.city,
      district: warehouse.district,
      contactPhone: warehouse.contactPhone,
      managerName: warehouse.managerName,
      capacity: warehouse.capacity,
      status: warehouse.status,
      driverCount: metrics.driverCount,
      vehicleCount: metrics.vehicleCount,
      currentLoad: metrics.currentLoad,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }

  // Batches the driver/vehicle/active-shipment counts for a page of warehouses so
  // the list can show live occupancy without N extra round-trips per row.
  private async withMetrics(
    warehouses: IWarehouse[],
  ): Promise<SafeWarehouse[]> {
    const ids = warehouses.map((w) => w._id);
    if (ids.length === 0) return [];

    const [driverGroups, vehicleGroups, shipmentGroups] = await Promise.all([
      UserModel.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $match: { role: "driver", warehouseId: { $in: ids } } },
        { $group: { _id: "$warehouseId", count: { $sum: 1 } } },
      ]),
      VehicleModel.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $match: { warehouseId: { $in: ids } } },
        { $group: { _id: "$warehouseId", count: { $sum: 1 } } },
      ]),
      // A shipment occupies both its origin and destination hub while active.
      ShipmentModel.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        {
          $match: {
            status: { $in: ["pending", "in-transit"] },
            $or: [
              { originWarehouseId: { $in: ids } },
              { destinationWarehouseId: { $in: ids } },
            ],
          },
        },
        {
          $project: {
            hubs: {
              $setUnion: [
                { $cond: ["$originWarehouseId", ["$originWarehouseId"], []] },
                {
                  $cond: [
                    "$destinationWarehouseId",
                    ["$destinationWarehouseId"],
                    [],
                  ],
                },
              ],
            },
          },
        },
        { $unwind: "$hubs" },
        { $match: { hubs: { $in: ids } } },
        { $group: { _id: "$hubs", count: { $sum: 1 } } },
      ]),
    ]);

    const driverBy = new Map(
      driverGroups.map((g) => [g._id.toString(), g.count]),
    );
    const vehicleBy = new Map(
      vehicleGroups.map((g) => [g._id.toString(), g.count]),
    );
    const loadBy = new Map(
      shipmentGroups.map((g) => [g._id.toString(), g.count]),
    );

    return warehouses.map((w) =>
      this.sanitize(w, {
        driverCount: driverBy.get(w._id.toString()) ?? 0,
        vehicleCount: vehicleBy.get(w._id.toString()) ?? 0,
        currentLoad: loadBy.get(w._id.toString()) ?? 0,
      }),
    );
  }

  async getWarehouses(
    page: number,
    limit: number,
    search = "",
    status?: WarehouseStatus,
  ): Promise<{ warehouses: SafeWarehouse[]; total: number }> {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
      ];
    }

    const [warehouses, total] = await Promise.all([
      WarehouseModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      WarehouseModel.countDocuments(query),
    ]);

    return { warehouses: await this.withMetrics(warehouses), total };
  }

  async getWarehouseById(id: string): Promise<SafeWarehouse> {
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) throw new HttpException(404, "Warehouse not found");
    const [safe] = await this.withMetrics([warehouse]);
    return safe;
  }

  // Lightweight list for the driver/vehicle/shipment dropdowns.
  async getOptions(): Promise<WarehouseOption[]> {
    const warehouses = await WarehouseModel.find({ status: "active" })
      .sort({ name: 1 })
      .select("_id name code");
    return warehouses.map((w) => ({
      id: w._id.toString(),
      name: w.name,
      code: w.code,
    }));
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalCapacity: number;
  }> {
    const [total, active, inactive, capacityAgg] = await Promise.all([
      WarehouseModel.countDocuments(),
      WarehouseModel.countDocuments({ status: "active" }),
      WarehouseModel.countDocuments({ status: "inactive" }),
      WarehouseModel.aggregate<{ total: number }>([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: "$capacity" } } },
      ]),
    ]);
    return {
      total,
      active,
      inactive,
      totalCapacity: capacityAgg[0]?.total ?? 0,
    };
  }

  async createWarehouse(
    input: AdminCreateWarehouseDTO,
  ): Promise<SafeWarehouse> {
    const code = input.code.trim().toUpperCase();
    const existing = await WarehouseModel.findOne({ code });
    if (existing) {
      throw new HttpException(400, "Warehouse code already exists");
    }
    const warehouse = await WarehouseModel.create({ ...input, code });
    return this.sanitize(warehouse);
  }

  async updateWarehouse(
    id: string,
    input: AdminUpdateWarehouseDTO,
  ): Promise<SafeWarehouse> {
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) throw new HttpException(404, "Warehouse not found");

    if (
      input.status === "inactive" &&
      warehouse.status !== "inactive"
    ) {
      await this.assertNoDependents(warehouse._id);
    }

    warehouse.set(input);
    await warehouse.save();
    const [safe] = await this.withMetrics([warehouse]);
    return safe;
  }

  async deactivateWarehouse(id: string): Promise<void> {
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) throw new HttpException(404, "Warehouse not found");
    await this.assertNoDependents(warehouse._id);
    warehouse.status = "inactive";
    await warehouse.save();
  }

  // A warehouse cannot be retired while drivers/vehicles are still based at it
  // or active shipments are routed through it.
  private async assertNoDependents(
    warehouseId: mongoose.Types.ObjectId,
  ): Promise<void> {
    const [drivers, vehicles, shipments] = await Promise.all([
      UserModel.countDocuments({ role: "driver", warehouseId }),
      VehicleModel.countDocuments({ warehouseId }),
      ShipmentModel.countDocuments({
        status: { $in: ["pending", "in-transit"] },
        $or: [
          { originWarehouseId: warehouseId },
          { destinationWarehouseId: warehouseId },
        ],
      }),
    ]);
    if (drivers > 0) {
      throw new HttpException(
        400,
        "Reassign the drivers based at this warehouse first",
      );
    }
    if (vehicles > 0) {
      throw new HttpException(
        400,
        "Reassign the vehicles based at this warehouse first",
      );
    }
    if (shipments > 0) {
      throw new HttpException(
        400,
        "Active shipments are routed through this warehouse",
      );
    }
  }
}
