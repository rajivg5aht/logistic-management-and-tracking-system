import mongoose from "mongoose";
import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import type { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import type { AdminCreateDriverDTO, AdminUpdateDriverDTO } from "../dtos/driver.dto";
import { IUser, UserModel } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import { ShipmentModel } from "../models/shipment.model";
import { VehicleModel } from "../models/vehicle.model";

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
  // Driver profile (only meaningful when role === "driver")
  licenseNumber?: string;
  vehicleType?: IUser["vehicleType"];
  vehicleNumber?: string;
  branch?: string;
  employmentStatus?: IUser["employmentStatus"];
  availabilityStatus?: IUser["availabilityStatus"];
  assignedVehicleId?: string | null;
  deliveriesCount?: number;
};

// Compact view of a driver's assigned vehicle, surfaced in the driver console.
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

    // If email is being updated, check if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await userRepository.getUserByEmail(
        updateData.email,
      );

      if (existingEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }

    // Hash password if it's being updated
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

  // Registration insight for the User Management KPI cards: customer signups in
  // the last 24h and month-over-month growth. Scoped to customers because that
  // is the public sign-up flow (drivers/admins are created internally).
  async adminGetUserStats(): Promise<{
    total: number;
    newSignups24h: number;
    signupsThisMonth: number;
    growthPct: number;
    registrationTrend: { label: string; count: number }[];
  }> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Nepal-local month boundaries (UTC+05:45) converted back to UTC for querying.
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

    // Start of the 7-day trend window: midnight (Nepal-local) six days ago,
    // stored as the equivalent UTC instant for querying.
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
      // Daily customer signups over the trend window, bucketed by Nepal-local day.
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

    // Grew-from-zero baseline reads as +100%; a flat/empty prior month is 0%.
    const growthPct =
      signupsLastMonth === 0
        ? signupsThisMonth > 0
          ? 100
          : 0
        : Math.round(
            ((signupsThisMonth - signupsLastMonth) / signupsLastMonth) * 100,
          );

    // Fill every day in the window (including zero-signup days) so the chart
    // always renders exactly 7 ordered bars, oldest → newest.
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
    if (userData.role && userData.role !== "customer") {
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
      role: "customer",
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

  // Driver management (admin-controlled internal staff)
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

    // Count each driver's completed deliveries in one grouped query so the
    // admin list can show lifetime delivery totals without N extra requests.
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

  // Aggregate counts for the driver-management KPI cards.
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

  // Permanently removes a driver account only when it has no operational history.
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

  // A driver toggles their own availability from the driver console.
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

  // The driver's own profile plus their currently assigned vehicle (if any),
  // used by the driver console to show live availability + vehicle details.
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
