"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const user_model_1 = require("../models/user.model");
const http_exception_1 = require("../exceptions/http-exception");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("../configs/constant");
const shipment_model_1 = require("../models/shipment.model");
const vehicle_model_1 = require("../models/vehicle.model");
const userRepository = new user_repository_1.UserMongoRepository();
class UserService {
    sanitizeUser(user) {
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
    async createUser(userData) {
        try {
            console.log("========== REGISTER START ==========");
            console.log("Incoming Data:", userData);
            console.log("STEP 1: Checking existing email");
            const existingEmail = await userRepository.getUserByEmail(userData.email);
            console.log("STEP 2: Email check completed");
            if (existingEmail) {
                console.log("STEP 2A: Email already exists");
                throw new http_exception_1.HttpException(400, "Email already exists");
            }
            console.log("STEP 3: Hashing password");
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
            console.log("STEP 4: Password hashed");
            console.log("STEP 5: Creating user in database");
            const user = await userRepository.createUser({
                ...userData,
                password: hashedPassword,
            });
            console.log("STEP 6: User created successfully");
            console.log("User ID:", user._id);
            console.log("========== REGISTER END ==========");
            return this.sanitizeUser(user);
        }
        catch (error) {
            console.error("========== REGISTER ERROR ==========");
            console.error(error);
            console.error("===================================");
            throw error;
        }
    }
    async loginUser(loginData) {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new http_exception_1.HttpException(401, "Invalid email or password");
        }
        if (user.status === "inactive") {
            throw new http_exception_1.HttpException(403, "This account is inactive");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new http_exception_1.HttpException(401, "Invalid email or password");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role,
        }, constant_1.SECRET_KEY, {
            expiresIn: "30d",
        });
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    async getUserById(userId) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        return this.sanitizeUser(user);
    }
    async updateUser(userId, updateData) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        // If email is being updated, check if it's already taken
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingEmail) {
                throw new http_exception_1.HttpException(400, "Email already exists");
            }
        }
        // Hash password if it's being updated
        if (updateData.password) {
            updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
        }
        const updatedUser = await userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw new http_exception_1.HttpException(500, "Failed to update user");
        }
        return this.sanitizeUser(updatedUser);
    }
    async adminGetUsers(page, limit, search, role) {
        const { users, total } = await userRepository.getPaginatedUsers(page, limit, search, role ? { role } : undefined);
        return {
            users: users.map((u) => this.sanitizeUser(u)),
            total,
        };
    }
    async adminCreateUser(userData) {
        if (userData.role && userData.role !== "customer") {
            throw new http_exception_1.HttpException(400, "Drivers must be created in Driver Management");
        }
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new http_exception_1.HttpException(400, "Email already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
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
    async adminUpdateUser(userId, updateData) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        if (updateData.role !== undefined) {
            throw new http_exception_1.HttpException(400, "Roles cannot be changed in User Management");
        }
        if (user.role === "driver") {
            throw new http_exception_1.HttpException(400, "Driver accounts must be edited in Driver Management");
        }
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingEmail) {
                throw new http_exception_1.HttpException(400, "Email already exists");
            }
        }
        if (updateData.password) {
            updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
        }
        const updatedUser = await userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw new http_exception_1.HttpException(500, "Failed to update user");
        }
        return this.sanitizeUser(updatedUser);
    }
    async adminDeleteUser(userId) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        if (user.role === "driver") {
            throw new http_exception_1.HttpException(400, "Driver accounts must be deactivated in Driver Management");
        }
        const updated = await userRepository.update(userId, { status: "inactive" });
        return !!updated;
    }
    // ── Driver management (admin-controlled internal staff) ────────────────────
    async adminGetDrivers(page, limit, search, availability) {
        const filter = { role: "driver" };
        if (availability) {
            filter.availabilityStatus = availability;
        }
        const { users, total } = await userRepository.getPaginatedUsers(page, limit, search, filter);
        return {
            drivers: users.map((u) => this.sanitizeUser(u)),
            total,
        };
    }
    async adminGetDriverById(driverId) {
        const user = await userRepository.getUserById(driverId);
        if (!user || user.role !== "driver") {
            throw new http_exception_1.HttpException(404, "Driver not found");
        }
        return this.sanitizeUser(user);
    }
    async adminCreateDriver(driverData) {
        const existingEmail = await userRepository.getUserByEmail(driverData.email);
        if (existingEmail) {
            throw new http_exception_1.HttpException(400, "Email already exists");
        }
        if (driverData.licenseNumber) {
            const existingLicense = await user_model_1.UserModel.findOne({
                role: "driver",
                licenseNumber: driverData.licenseNumber,
            });
            if (existingLicense) {
                throw new http_exception_1.HttpException(400, "Driver license already exists");
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(driverData.password, 10);
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
    async adminUpdateDriver(driverId, updateData) {
        const driver = await userRepository.getUserById(driverId);
        if (!driver || driver.role !== "driver") {
            throw new http_exception_1.HttpException(404, "Driver not found");
        }
        if (updateData.email && updateData.email !== driver.email) {
            const existingEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingEmail) {
                throw new http_exception_1.HttpException(400, "Email already exists");
            }
        }
        if (updateData.licenseNumber &&
            updateData.licenseNumber !== driver.licenseNumber) {
            const existingLicense = await user_model_1.UserModel.findOne({
                _id: { $ne: driver._id },
                role: "driver",
                licenseNumber: updateData.licenseNumber,
            });
            if (existingLicense) {
                throw new http_exception_1.HttpException(400, "Driver license already exists");
            }
        }
        if (updateData.status === "inactive") {
            const activeShipments = await shipment_model_1.ShipmentModel.countDocuments({
                assignedDriverId: driver._id,
                status: { $nin: ["delivered", "cancelled"] },
            });
            if (activeShipments > 0) {
                throw new http_exception_1.HttpException(400, "Driver has active shipments and cannot be deactivated");
            }
            const assignedVehicle = await vehicle_model_1.VehicleModel.findOne({
                assignedDriverId: driver._id,
            });
            if (assignedVehicle) {
                throw new http_exception_1.HttpException(400, "Unassign the driver's vehicle before deactivation");
            }
            updateData.availabilityStatus = "inactive";
        }
        else if (updateData.status === "active" &&
            driver.status === "inactive" &&
            (!updateData.availabilityStatus ||
                updateData.availabilityStatus === "inactive")) {
            updateData.availabilityStatus = "available";
        }
        if (updateData.status !== "inactive" &&
            updateData.availabilityStatus &&
            updateData.availabilityStatus !== driver.availabilityStatus) {
            const activeShipments = await shipment_model_1.ShipmentModel.countDocuments({
                assignedDriverId: driver._id,
                status: { $nin: ["delivered", "cancelled"] },
            });
            if (activeShipments > 0) {
                throw new http_exception_1.HttpException(400, "Availability is controlled by the active shipment");
            }
            if (["assigned", "on-delivery", "inactive"].includes(updateData.availabilityStatus)) {
                throw new http_exception_1.HttpException(400, "This availability state is controlled by the system");
            }
        }
        if (updateData.password) {
            updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
        }
        const updated = await userRepository.update(driverId, updateData);
        if (!updated) {
            throw new http_exception_1.HttpException(500, "Failed to update driver");
        }
        return this.sanitizeUser(updated);
    }
    async adminDeleteDriver(driverId) {
        const driver = await userRepository.getUserById(driverId);
        if (!driver || driver.role !== "driver") {
            throw new http_exception_1.HttpException(404, "Driver not found");
        }
        const activeShipments = await shipment_model_1.ShipmentModel.countDocuments({
            assignedDriverId: driver._id,
            status: { $nin: ["delivered", "cancelled"] },
        });
        if (activeShipments > 0) {
            throw new http_exception_1.HttpException(400, "Driver has active shipments and cannot be deactivated");
        }
        const assignedVehicle = await vehicle_model_1.VehicleModel.findOne({
            assignedDriverId: driver._id,
        });
        if (assignedVehicle) {
            throw new http_exception_1.HttpException(400, "Unassign the driver's vehicle before deactivation");
        }
        const updated = await userRepository.update(driverId, {
            status: "inactive",
            availabilityStatus: "inactive",
        });
        return !!updated;
    }
    // A driver toggles their own availability from the driver console.
    async updateAvailability(driverId, availabilityStatus) {
        if (!["available", "off-duty"].includes(availabilityStatus)) {
            throw new http_exception_1.HttpException(400, "Drivers can only switch between available and off-duty");
        }
        const driver = await userRepository.getUserById(driverId);
        if (!driver || driver.role !== "driver") {
            throw new http_exception_1.HttpException(404, "Driver not found");
        }
        if (driver.status !== "active") {
            throw new http_exception_1.HttpException(400, "Inactive drivers cannot change availability");
        }
        const activeAssignments = await shipment_model_1.ShipmentModel.countDocuments({
            assignedDriverId: driver._id,
            status: { $nin: ["delivered", "cancelled"] },
        });
        if (activeAssignments > 0) {
            throw new http_exception_1.HttpException(400, "Availability is controlled by the active shipment");
        }
        const updated = await userRepository.update(driverId, {
            availabilityStatus: availabilityStatus,
        });
        if (!updated) {
            throw new http_exception_1.HttpException(404, "Driver not found");
        }
        return this.sanitizeUser(updated);
    }
}
exports.UserService = UserService;
