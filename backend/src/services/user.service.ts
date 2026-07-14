import mongoose from "mongoose";
import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import type { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import type {
  AdminCreateDriverDTO,
  AdminUpdateDriverDTO,
  DriverFleetIncidentDTO,
  DriverFleetIncidentUpdateDTO,
  DriverFuelExpenseDTO,
  DriverFuelExpenseUpdateDTO,
} from "../dtos/driver.dto";
import { IUser, UserModel } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import { ShipmentModel } from "../models/shipment.model";
import { VehicleModel, type IVehicle } from "../models/vehicle.model";
import {
  VehicleIncidentModel,
  type IVehicleIncident,
} from "../models/vehicleIncident.model";
import {
  VehicleFuelExpenseModel,
  type IVehicleFuelExpense,
} from "../models/vehicleFuelExpense.model";
import { MaintenanceWorkOrderModel, type IMaintenanceWorkOrder } from "../models/maintenanceWorkOrder.model";

const userRepository = new UserMongoRepository();

export type SafeUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  role: IUser["role"];
  status?: string;
  createdAt?: Date;
  licenseNumber?: string;
  vehicleType?: IUser["vehicleType"];
  vehicleNumber?: string;
  branch?: string;
  employmentStatus?: IUser["employmentStatus"];
  availabilityStatus?: IUser["availabilityStatus"];
  assignedVehicleId?: string | null;
  deliveriesCount?: number;
};

export type DriverVehicleSummary = {
  id: string;
  registrationNumber: string;
  type: string;
  make: string;
  model: string;
  capacityKg: number | null;
  status: string;
};

export type DriverMe = SafeUser & { vehicle: DriverVehicleSummary | null };

export type DriverFleetVehicle = DriverVehicleSummary & {
  year?: number;
  branch: string;
  imageUrl: string | null;
  insuranceExpiry: Date | null;
  registrationExpiry: Date | null;
  lastServiceAt: Date | null;
  nextServiceAt: Date | null;
  odometerKm: number;
  assignedAt: Date | null;
  updatedAt: Date;
};

export type DriverFleetAssignment = {
  vehicleId: string;
  registrationNumber: string;
  type: string;
  make: string;
  model: string;
  assignedAt: Date;
  unassignedAt: Date | null;
  status: string;
  odometerKm: number;
};

export type DriverFleetIncident = {
  id: string;
  category: string;
  severity: string;
  description: string;
  location: string;
  status: string;
  adminNote: string;
  resolutionNote: string;
  rejectionReason: string;
  maintenanceAction: string;
  workOrder: {
    status: string;
    assignedToName: string | null;
    vendorName: string;
    expectedCompletionAt: Date | null;
    repairNotes: string;
    updatedAt: Date;
  } | null;
  reviewedAt: Date | null;
  resolvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DriverFuelExpense = {
  id: string;
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
  approvedAt: Date | null;
  reimbursedAt: Date | null;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DriverFleet = {
  vehicle: DriverFleetVehicle | null;
  assignmentHistory: DriverFleetAssignment[];
  incidents: DriverFleetIncident[];
  fuelExpenses: DriverFuelExpense[];
};

export class UserService {
  private hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  private sanitizeUser(user: IUser): SafeUser {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      profileImage: user.profileImage || null,
      role: user.role,
      status: user.status || "active",
      createdAt: user.createdAt,
      licenseNumber: user.licenseNumber || "",
      vehicleType: user.vehicleType,
      vehicleNumber: user.vehicleNumber || "",
      branch: user.branch || "",
      employmentStatus: user.employmentStatus,
      availabilityStatus: user.availabilityStatus,
      assignedVehicleId: user.assignedVehicleId?.toString() ?? null,
    };
  }

  private sanitizeDriverFleetVehicle(
    vehicle: IVehicle,
    driverId: string,
  ): DriverFleetVehicle {
    const matchingAssignments = vehicle.assignmentHistory.filter(
      (entry) => entry.driverId.toString() === driverId,
    );
    const currentAssignment =
      matchingAssignments.find((entry) => !entry.unassignedAt) ??
      matchingAssignments[matchingAssignments.length - 1] ??
      null;

    return {
      id: vehicle._id.toString(),
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.vehicleModel,
      year: vehicle.year,
      capacityKg: vehicle.capacityKg ?? null,
      branch: vehicle.branch,
      imageUrl: vehicle.imageUrl ?? null,
      status: vehicle.status,
      insuranceExpiry: vehicle.insuranceExpiry,
      registrationExpiry: vehicle.registrationExpiry,
      lastServiceAt: vehicle.lastServiceAt,
      nextServiceAt: vehicle.nextServiceAt,
      odometerKm: vehicle.odometerKm,
      assignedAt: currentAssignment?.assignedAt ?? null,
      updatedAt: vehicle.updatedAt,
    };
  }

  private sanitizeFleetIncident(
    incident: IVehicleIncident,
    workOrder?: IMaintenanceWorkOrder,
    maintenanceNames: Map<string, string> = new Map(),
  ): DriverFleetIncident {
    return {
      id: incident._id.toString(),
      category: incident.category,
      severity: incident.severity,
      description: incident.description,
      location: incident.location,
      status: incident.status,
      adminNote: incident.adminNote ?? "",
      resolutionNote: incident.resolutionNote ?? "",
      rejectionReason: incident.rejectionReason ?? "",
      maintenanceAction: incident.maintenanceAction ?? "",
      workOrder: workOrder
        ? {
            status: workOrder.status,
            assignedToName: workOrder.assignedTo
              ? maintenanceNames.get(workOrder.assignedTo.toString()) ?? null
              : null,
            vendorName: workOrder.vendorName ?? "",
            expectedCompletionAt: workOrder.expectedCompletionAt ?? null,
            repairNotes: workOrder.repairNotes ?? "",
            updatedAt: workOrder.updatedAt,
          }
        : null,
      reviewedAt: incident.reviewedAt ?? null,
      resolvedAt: incident.resolvedAt ?? null,
      rejectedAt: incident.rejectedAt ?? null,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    };
  }

  private sanitizeFuelExpense(
    expense: IVehicleFuelExpense,
  ): DriverFuelExpense {
    return {
      id: expense._id.toString(),
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
      approvedAt: expense.approvedAt ?? null,
      reimbursedAt: expense.reimbursedAt ?? null,
      paymentReference: expense.paymentReference ?? "",
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  private async getDriverWithAssignedVehicle(driverId: string) {
    const driver = await userRepository.getUserById(driverId);
    if (!driver || driver.role !== "driver") {
      throw new HttpException(404, "Driver not found");
    }

    const vehicle = driver.assignedVehicleId
      ? await VehicleModel.findById(driver.assignedVehicleId)
      : await VehicleModel.findOne({ assignedDriverId: driver._id });

    return { driver, vehicle };
  }

  async createUser(userData: CreateUserDTO): Promise<SafeUser> {
    const existingEmail = await userRepository.getUserByEmail(userData.email);

    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const hashedPassword = await this.hashPassword(userData.password);
    const user = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    return this.sanitizeUser(user);
  }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);

    if (!user) {
      throw new HttpException(401, "Invalid email or password");
    }

    if (user.status === "inactive") {
      throw new HttpException(403, "This account is inactive");
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      SECRET_KEY,
      {
        expiresIn: "30d",
      },
    );

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getUserById(userId: string): Promise<SafeUser> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return this.sanitizeUser(user);
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserDTO,
  ): Promise<SafeUser> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await userRepository.getUserByEmail(
        updateData.email,
      );

      if (existingEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }

    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    const updatedUser = await userRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new HttpException(500, "Failed to update user");
    }

    return this.sanitizeUser(updatedUser);
  }

  async adminGetUsers(
    page: number,
    limit: number,
    search?: string,
    role?: string,
  ): Promise<{ users: SafeUser[]; total: number }> {
    const { users, total } = await userRepository.getPaginatedUsers(
      page,
      limit,
      search,
      role ? { role } : undefined,
    );

    return {
      users: users.map((u) => this.sanitizeUser(u)),
      total,
    };
  }

  async adminGetUserStats(): Promise<{
    total: number;
    newSignups24h: number;
    signupsThisMonth: number;
    growthPct: number;
    registrationTrend: { label: string; count: number }[];
  }> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
    const nowInNepal = new Date(now.getTime() + nepalOffsetMs);
    const startOfThisMonth = new Date(
      Date.UTC(nowInNepal.getUTCFullYear(), nowInNepal.getUTCMonth(), 1) -
        nepalOffsetMs,
    );
    const startOfLastMonth = new Date(
      Date.UTC(nowInNepal.getUTCFullYear(), nowInNepal.getUTCMonth() - 1, 1) -
        nepalOffsetMs,
    );

    const startOfTodayNepal = new Date(
      Date.UTC(
        nowInNepal.getUTCFullYear(),
        nowInNepal.getUTCMonth(),
        nowInNepal.getUTCDate(),
      ) - nepalOffsetMs,
    );
    const dayMs = 24 * 60 * 60 * 1000;
    const trendStart = new Date(startOfTodayNepal.getTime() - 6 * dayMs);

    const [
      total,
      newSignups24h,
      signupsThisMonth,
      signupsLastMonth,
      trendRaw,
    ] = await Promise.all([
      UserModel.countDocuments({}),
      UserModel.countDocuments({
        role: "customer",
        createdAt: { $gte: dayAgo },
      }),
      UserModel.countDocuments({
        role: "customer",
        createdAt: { $gte: startOfThisMonth },
      }),
      UserModel.countDocuments({
        role: "customer",
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      UserModel.aggregate<{ _id: string; count: number }>([
        { $match: { role: "customer", createdAt: { $gte: trendStart } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kathmandu",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const growthPct =
      signupsLastMonth === 0
        ? signupsThisMonth > 0
          ? 100
          : 0
        : Math.round(
            ((signupsThisMonth - signupsLastMonth) / signupsLastMonth) * 100,
          );

    const countByDay = new Map(trendRaw.map((r) => [r._id, r.count]));
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const registrationTrend = Array.from({ length: 7 }, (_, i) => {
      const dayInNepal = new Date(
        trendStart.getTime() + i * dayMs + nepalOffsetMs,
      );
      const key = `${dayInNepal.getUTCFullYear()}-${String(
        dayInNepal.getUTCMonth() + 1,
      ).padStart(2, "0")}-${String(dayInNepal.getUTCDate()).padStart(2, "0")}`;
      return {
        label: weekdayLabels[dayInNepal.getUTCDay()],
        count: countByDay.get(key) ?? 0,
      };
    });

    return {
      total,
      newSignups24h,
      signupsThisMonth,
      growthPct,
      registrationTrend,
    };
  }

  async adminCreateUser(userData: AdminCreateUserDTO): Promise<SafeUser> {
    if (userData.role && !["customer", "maintenance"].includes(userData.role)) {
      throw new HttpException(
        400,
        "Drivers must be created in Driver Management",
      );
    }

    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const hashedPassword = await this.hashPassword(userData.password);

    const user = await userRepository.createUser({
      fullName: userData.fullName,
      email: userData.email,
      password: hashedPassword,
      phoneNumber: userData.phoneNumber || "",
      role: userData.role,
      status: userData.status ?? "active",
    });

    return this.sanitizeUser(user);
  }

  async adminUpdateUser(
    userId: string,
    updateData: AdminUpdateUserDTO,
  ): Promise<SafeUser> {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (user.role === "driver") {
      throw new HttpException(
        400,
        "Driver accounts must be edited in Driver Management",
      );
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await userRepository.getUserByEmail(
        updateData.email,
      );
      if (existingEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }

    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    const updatedUser = await userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new HttpException(500, "Failed to update user");
    }

    return this.sanitizeUser(updatedUser);
  }

  async adminDeleteUser(userId: string): Promise<boolean> {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (user.role === "driver") {
      throw new HttpException(
        400,
        "Driver accounts must be managed in Driver Management",
      );
    }

    const shipmentHistory = await ShipmentModel.countDocuments({
      customer: user._id,
    });
    if (shipmentHistory > 0) {
      throw new HttpException(
        409,
        "User has shipment history and cannot be deleted. Set the account to inactive instead.",
      );
    }

    return userRepository.delete(userId);
  }

  async adminGetDrivers(
    page: number,
    limit: number,
    search?: string,
    availability?: string,
  ): Promise<{ drivers: SafeUser[]; total: number }> {
    const filter: Record<string, unknown> = { role: "driver" };
    if (availability) {
      filter.availabilityStatus = availability;
    }

    const { users, total } = await userRepository.getPaginatedUsers(
      page,
      limit,
      search,
      filter,
    );

    const driverIds = users.map((u) => u._id);
    const deliveryCounts = await ShipmentModel.aggregate<{
      _id: mongoose.Types.ObjectId;
      count: number;
    }>([
      { $match: { assignedDriverId: { $in: driverIds }, status: "delivered" } },
      { $group: { _id: "$assignedDriverId", count: { $sum: 1 } } },
    ]);
    const countByDriver = new Map(
      deliveryCounts.map((entry) => [entry._id.toString(), entry.count]),
    );

    return {
      drivers: users.map((u) => ({
        ...this.sanitizeUser(u),
        deliveriesCount: countByDriver.get(u._id.toString()) ?? 0,
      })),
      total,
    };
  }

  async adminGetDriverStats(): Promise<{
    total: number;
    onDelivery: number;
    offDuty: number;
    available: number;
    inactive: number;
  }> {
    const [total, onDelivery, offDuty, available, inactive] = await Promise.all([
      UserModel.countDocuments({ role: "driver" }),
      UserModel.countDocuments({
        role: "driver",
        availabilityStatus: "on-delivery",
      }),
      UserModel.countDocuments({
        role: "driver",
        availabilityStatus: "off-duty",
      }),
      UserModel.countDocuments({
        role: "driver",
        availabilityStatus: "available",
      }),
      UserModel.countDocuments({ role: "driver", status: "inactive" }),
    ]);
    return { total, onDelivery, offDuty, available, inactive };
  }

  async adminGetDriverById(driverId: string): Promise<SafeUser> {
    const user = await userRepository.getUserById(driverId);
    if (!user || user.role !== "driver") {
      throw new HttpException(404, "Driver not found");
    }
    return this.sanitizeUser(user);
  }

  async adminCreateDriver(driverData: AdminCreateDriverDTO): Promise<SafeUser> {
    const existingEmail = await userRepository.getUserByEmail(driverData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    if (driverData.licenseNumber) {
      const existingLicense = await UserModel.findOne({
        role: "driver",
        licenseNumber: driverData.licenseNumber,
      });
      if (existingLicense) {
        throw new HttpException(400, "Driver license already exists");
      }
    }

    const hashedPassword = await this.hashPassword(driverData.password);

    const driver = await userRepository.createUser({
      fullName: driverData.fullName,
      email: driverData.email,
      password: hashedPassword,
      phoneNumber: driverData.phoneNumber || "",
      role: "driver",
      status: "active",
      licenseNumber: driverData.licenseNumber || "",
      branch: driverData.branch || "",
      employmentStatus: driverData.employmentStatus ?? "full-time",
      availabilityStatus: driverData.availabilityStatus ?? "available",
    });

    return this.sanitizeUser(driver);
  }

  async adminUpdateDriver(
    driverId: string,
    updateData: AdminUpdateDriverDTO,
  ): Promise<SafeUser> {
    const driver = await userRepository.getUserById(driverId);
    if (!driver || driver.role !== "driver") {
      throw new HttpException(404, "Driver not found");
    }

    if (updateData.email && updateData.email !== driver.email) {
      const existingEmail = await userRepository.getUserByEmail(
        updateData.email,
      );
      if (existingEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }

    if (
      updateData.licenseNumber &&
      updateData.licenseNumber !== driver.licenseNumber
    ) {
      const existingLicense = await UserModel.findOne({
        _id: { $ne: driver._id },
        role: "driver",
        licenseNumber: updateData.licenseNumber,
      });
      if (existingLicense) {
        throw new HttpException(400, "Driver license already exists");
      }
    }

    if (updateData.status === "inactive") {
      const activeShipments = await ShipmentModel.countDocuments({
        assignedDriverId: driver._id,
        status: { $nin: ["delivered", "cancelled"] },
      });
      if (activeShipments > 0) {
        throw new HttpException(
          400,
          "Driver has active shipments and cannot be deactivated",
        );
      }
      const assignedVehicle = await VehicleModel.findOne({
        assignedDriverId: driver._id,
      });
      if (assignedVehicle) {
        throw new HttpException(
          400,
          "Unassign the driver's vehicle before deactivation",
        );
      }
      updateData.availabilityStatus = "inactive";
    } else if (
      updateData.status === "active" &&
      driver.status === "inactive" &&
      (!updateData.availabilityStatus ||
        updateData.availabilityStatus === "inactive")
    ) {
      updateData.availabilityStatus = "available";
    }

    if (
      updateData.status !== "inactive" &&
      updateData.availabilityStatus &&
      updateData.availabilityStatus !== driver.availabilityStatus
    ) {
      const activeShipments = await ShipmentModel.countDocuments({
        assignedDriverId: driver._id,
        status: { $nin: ["delivered", "cancelled"] },
      });
      if (activeShipments > 0) {
        throw new HttpException(
          400,
          "Availability is controlled by the active shipment",
        );
      }
      if (
        ["assigned", "on-delivery", "inactive"].includes(
          updateData.availabilityStatus,
        )
      ) {
        throw new HttpException(
          400,
          "This availability state is controlled by the system",
        );
      }
    }

    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    const updated = await userRepository.update(driverId, updateData);
    if (!updated) {
      throw new HttpException(500, "Failed to update driver");
    }
    return this.sanitizeUser(updated);
  }

  async adminDeleteDriver(driverId: string): Promise<boolean> {
    const driver = await userRepository.getUserById(driverId);
    if (!driver || driver.role !== "driver") {
      throw new HttpException(404, "Driver not found");
    }

    const activeShipments = await ShipmentModel.countDocuments({
      assignedDriverId: driver._id,
      status: { $nin: ["delivered", "cancelled"] },
    });
    if (activeShipments > 0) {
      throw new HttpException(
        400,
        "Driver has active shipments and cannot be deleted",
      );
    }

    const shipmentHistory = await ShipmentModel.countDocuments({
      assignedDriverId: driver._id,
    });
    if (shipmentHistory > 0) {
      throw new HttpException(
        409,
        "Driver has shipment history and cannot be deleted. Set the account to inactive instead.",
      );
    }

    const assignedVehicle = await VehicleModel.findOne({
      assignedDriverId: driver._id,
    });
    if (assignedVehicle) {
      throw new HttpException(
        400,
        "Unassign the driver's vehicle before deletion",
      );
    }

    return userRepository.delete(driverId);
  }

  async updateAvailability(
    driverId: string,
    availabilityStatus: string,
  ): Promise<SafeUser> {
    if (!["available", "off-duty"].includes(availabilityStatus)) {
      throw new HttpException(
        400,
        "Drivers can only switch between available and off-duty",
      );
    }
    const driver = await userRepository.getUserById(driverId);
    if (!driver || driver.role !== "driver") {
      throw new HttpException(404, "Driver not found");
    }
    if (driver.status !== "active") {
      throw new HttpException(400, "Inactive drivers cannot change availability");
    }
    const activeAssignments = await ShipmentModel.countDocuments({
      assignedDriverId: driver._id,
      status: { $nin: ["delivered", "cancelled"] },
    });
    if (activeAssignments > 0) {
      throw new HttpException(
        400,
        "Availability is controlled by the active shipment",
      );
    }
    const updated = await userRepository.update(driverId, {
      availabilityStatus: availabilityStatus as IUser["availabilityStatus"],
    });
    if (!updated) {
      throw new HttpException(404, "Driver not found");
    }
    return this.sanitizeUser(updated);
  }

  async getDriverFleet(driverId: string): Promise<DriverFleet> {
    const { driver, vehicle } = await this.getDriverWithAssignedVehicle(driverId);

    const historyVehicles = await VehicleModel.find({
      "assignmentHistory.driverId": driver._id,
    }).sort({ updatedAt: -1 });

    const assignmentHistory = historyVehicles
      .flatMap((historyVehicle) =>
        historyVehicle.assignmentHistory
          .filter((entry) => entry.driverId.toString() === driver._id.toString())
          .map((entry) => ({
            vehicleId: historyVehicle._id.toString(),
            registrationNumber: historyVehicle.registrationNumber,
            type: historyVehicle.type,
            make: historyVehicle.make,
            model: historyVehicle.vehicleModel,
            assignedAt: entry.assignedAt,
            unassignedAt: entry.unassignedAt ?? null,
            status: entry.unassignedAt ? "released" : "current",
            odometerKm: historyVehicle.odometerKm,
          })),
      )
      .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());

    const [incidents, fuelExpenses] = vehicle
      ? await Promise.all([
          VehicleIncidentModel.find({
            vehicleId: vehicle._id,
            driverId: driver._id,
          })
            .sort({ createdAt: -1 })
            .limit(25),
          VehicleFuelExpenseModel.find({
            vehicleId: vehicle._id,
            driverId: driver._id,
          })
            .sort({ createdAt: -1 })
            .limit(25),
        ])
      : [[], []];

    const workOrders = incidents.length
      ? await MaintenanceWorkOrderModel.find({
          incidentId: { $in: incidents.map((incident) => incident._id) },
        })
      : [];
    const maintenanceUserIds = workOrders
      .map((workOrder) => workOrder.assignedTo)
      .filter((id): id is mongoose.Types.ObjectId => !!id);
    const maintenanceUsers = maintenanceUserIds.length
      ? await UserModel.find({ _id: { $in: maintenanceUserIds } }).select(
          "_id fullName",
        )
      : [];
    const maintenanceNames = new Map(
      maintenanceUsers.map((user) => [user._id.toString(), user.fullName]),
    );
    const workOrdersByIncident = new Map(
      workOrders.map((workOrder) => [workOrder.incidentId.toString(), workOrder]),
    );

    return {
      vehicle: vehicle
        ? this.sanitizeDriverFleetVehicle(vehicle, driver._id.toString())
        : null,
      assignmentHistory,
      incidents: incidents.map((incident) =>
        this.sanitizeFleetIncident(
          incident,
          workOrdersByIncident.get(incident._id.toString()),
          maintenanceNames,
        ),
      ),
      fuelExpenses: fuelExpenses.map((expense) => this.sanitizeFuelExpense(expense)),
    };
  }
  private async getOwnedFleetIncident(
    driverId: string,
    incidentId: string,
  ): Promise<IVehicleIncident> {
    if (!mongoose.isValidObjectId(incidentId)) {
      throw new HttpException(404, "Incident not found");
    }

    const incident = await VehicleIncidentModel.findById(incidentId);
    if (!incident || incident.driverId.toString() !== driverId) {
      throw new HttpException(404, "Incident not found");
    }
    return incident;
  }

  private async getOwnedFuelExpense(
    driverId: string,
    expenseId: string,
  ): Promise<IVehicleFuelExpense> {
    if (!mongoose.isValidObjectId(expenseId)) {
      throw new HttpException(404, "Fuel expense not found");
    }

    const expense = await VehicleFuelExpenseModel.findById(expenseId);
    if (!expense || expense.driverId.toString() !== driverId) {
      throw new HttpException(404, "Fuel expense not found");
    }
    return expense;
  }

  private async moveVehicleToMaintenance(vehicleId: mongoose.Types.ObjectId) {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || vehicle.status === "inactive") return;
    vehicle.status = "maintenance";
    await vehicle.save();
  }

  async createDriverFleetIncident(
    driverId: string,
    input: DriverFleetIncidentDTO,
  ): Promise<DriverFleetIncident> {
    const { driver, vehicle } = await this.getDriverWithAssignedVehicle(driverId);
    if (!vehicle) {
      throw new HttpException(400, "No vehicle assigned to report an issue");
    }

    const incident = await VehicleIncidentModel.create({
      vehicleId: vehicle._id,
      driverId: driver._id,
      category: input.category,
      severity: input.severity,
      description: input.description,
      location: input.location,
    });

    if (input.severity === "critical") {
      await this.moveVehicleToMaintenance(vehicle._id);
    }

    return this.sanitizeFleetIncident(incident);
  }

  async updateDriverFleetIncident(
    driverId: string,
    incidentId: string,
    input: DriverFleetIncidentUpdateDTO,
  ): Promise<DriverFleetIncident> {
    const incident = await this.getOwnedFleetIncident(driverId, incidentId);
    if (incident.status !== "open") {
      throw new HttpException(400, "Incident is already under admin review");
    }

    if (input.category !== undefined) incident.category = input.category;
    if (input.severity !== undefined) incident.severity = input.severity;
    if (input.description !== undefined) incident.description = input.description;
    if (input.location !== undefined) incident.location = input.location;

    await incident.save();

    if (incident.severity === "critical") {
      await this.moveVehicleToMaintenance(incident.vehicleId);
    }

    return this.sanitizeFleetIncident(incident);
  }

  async deleteDriverFleetIncident(
    driverId: string,
    incidentId: string,
  ): Promise<boolean> {
    const incident = await this.getOwnedFleetIncident(driverId, incidentId);
    if (incident.status !== "open") {
      throw new HttpException(400, "Incident is already under admin review");
    }

    await incident.deleteOne();
    return true;
  }

  async createDriverFuelExpense(
    driverId: string,
    input: DriverFuelExpenseDTO,
    receiptUrl = "",
  ): Promise<DriverFuelExpense> {
    const { driver, vehicle } = await this.getDriverWithAssignedVehicle(driverId);
    if (!vehicle) {
      throw new HttpException(400, "No vehicle assigned to log fuel expense");
    }

    const expense = await VehicleFuelExpenseModel.create({
      vehicleId: vehicle._id,
      driverId: driver._id,
      fuelType: input.fuelType,
      liters: input.liters,
      amount: input.amount,
      odometerKm: input.odometerKm,
      stationName: input.stationName,
      notes: input.notes,
      receiptUrl,
    });

    if (input.odometerKm > vehicle.odometerKm) {
      vehicle.odometerKm = input.odometerKm;
      await vehicle.save();
    }

    return this.sanitizeFuelExpense(expense);
  }

  async updateDriverFuelExpense(
    driverId: string,
    expenseId: string,
    input: DriverFuelExpenseUpdateDTO,
    receiptUrl?: string,
  ): Promise<DriverFuelExpense> {
    const expense = await this.getOwnedFuelExpense(driverId, expenseId);
    if (expense.status !== "submitted") {
      throw new HttpException(400, "Fuel expense is already under admin review");
    }

    if (input.fuelType !== undefined) expense.fuelType = input.fuelType;
    if (input.liters !== undefined) expense.liters = input.liters;
    if (input.amount !== undefined) expense.amount = input.amount;
    if (input.odometerKm !== undefined) expense.odometerKm = input.odometerKm;
    if (input.stationName !== undefined) expense.stationName = input.stationName;
    if (input.notes !== undefined) expense.notes = input.notes;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

    await expense.save();

    if (input.odometerKm !== undefined) {
      const vehicle = await VehicleModel.findById(expense.vehicleId);
      if (vehicle && input.odometerKm > vehicle.odometerKm) {
        vehicle.odometerKm = input.odometerKm;
        await vehicle.save();
      }
    }

    return this.sanitizeFuelExpense(expense);
  }

  async deleteDriverFuelExpense(
    driverId: string,
    expenseId: string,
  ): Promise<boolean> {
    const expense = await this.getOwnedFuelExpense(driverId, expenseId);
    if (expense.status !== "submitted") {
      throw new HttpException(400, "Fuel expense is already under admin review");
    }

    await expense.deleteOne();
    return true;
  }
  async getDriverMe(driverId: string): Promise<DriverMe> {
    const driver = await userRepository.getUserById(driverId);
    if (!driver || driver.role !== "driver") {
      throw new HttpException(404, "Driver not found");
    }

    let vehicle: DriverVehicleSummary | null = null;
    if (driver.assignedVehicleId) {
      const v = await VehicleModel.findById(driver.assignedVehicleId);
      if (v) {
        vehicle = {
          id: v._id.toString(),
          registrationNumber: v.registrationNumber,
          type: v.type,
          make: v.make,
          model: v.vehicleModel,
          capacityKg: v.capacityKg ?? null,
          status: v.status,
        };
      }
    }

    return { ...this.sanitizeUser(driver), vehicle };
  }
}
