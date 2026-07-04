import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

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
};

export class UserService {
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
    };
  }

 async createUser(userData: CreateUserDTO): Promise<SafeUser> {
  try {
    console.log("========== REGISTER START ==========");
    console.log("Incoming Data:", userData);

    console.log("STEP 1: Checking existing email");

    const existingEmail = await userRepository.getUserByEmail(
      userData.email,
    );

    console.log("STEP 2: Email check completed");

    if (existingEmail) {
      console.log("STEP 2A: Email already exists");

      throw new HttpException(
        400,
        "Email already exists",
      );
    }

    console.log("STEP 3: Hashing password");

    const hashedPassword = await bcryptjs.hash(
      userData.password,
      10,
    );

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
  } catch (error: any) {
    console.error("========== REGISTER ERROR ==========");
    console.error(error);
    console.error("===================================");

    throw error;
  }
 }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);

    if (!user) {
      throw new HttpException(401, "Invalid email or password");
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
      updateData.password = await bcryptjs.hash(updateData.password, 10);
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
  ): Promise<{ users: SafeUser[]; total: number }> {
    const { users, total } = await userRepository.getPaginatedUsers(
      page,
      limit,
      search,
    );

    return {
      users: users.map((u) => this.sanitizeUser(u)),
      total,
    };
  }

  async adminCreateUser(userData: any): Promise<SafeUser> {
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const hashedPassword = await bcryptjs.hash(userData.password, 10);

    const user = await userRepository.createUser({
      fullName: userData.fullName,
      email: userData.email,
      password: hashedPassword,
      phoneNumber: userData.phoneNumber || "",
      role: userData.role ?? "user",
      status: userData.status ?? "active",
    });

    return this.sanitizeUser(user);
  }

  async adminUpdateUser(userId: string, updateData: any): Promise<SafeUser> {
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
      updateData.password = await bcryptjs.hash(updateData.password, 10);
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

    return userRepository.delete(userId);
  }

  // ── Driver management (admin-controlled internal staff) ────────────────────
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

    return {
      drivers: users.map((u) => this.sanitizeUser(u)),
      total,
    };
  }

  async adminGetDriverById(driverId: string): Promise<SafeUser> {
    const user = await userRepository.getUserById(driverId);
    if (!user || user.role !== "driver") {
      throw new HttpException(404, "Driver not found");
    }
    return this.sanitizeUser(user);
  }

  async adminCreateDriver(driverData: any): Promise<SafeUser> {
    const existingEmail = await userRepository.getUserByEmail(driverData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const hashedPassword = await bcryptjs.hash(driverData.password, 10);

    const driver = await userRepository.createUser({
      fullName: driverData.fullName,
      email: driverData.email,
      password: hashedPassword,
      phoneNumber: driverData.phoneNumber || "",
      role: "driver",
      status: "active",
      licenseNumber: driverData.licenseNumber || "",
      vehicleType: driverData.vehicleType,
      vehicleNumber: driverData.vehicleNumber || "",
      branch: driverData.branch || "",
      employmentStatus: driverData.employmentStatus ?? "full-time",
      availabilityStatus: driverData.availabilityStatus ?? "available",
    });

    return this.sanitizeUser(driver);
  }

  async adminUpdateDriver(
    driverId: string,
    updateData: any,
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

    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, 10);
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
    return userRepository.delete(driverId);
  }

  // A driver toggles their own availability from the driver console.
  async updateAvailability(
    driverId: string,
    availabilityStatus: string,
  ): Promise<SafeUser> {
    const updated = await userRepository.update(driverId, {
      availabilityStatus: availabilityStatus as IUser["availabilityStatus"],
    });
    if (!updated) {
      throw new HttpException(404, "Driver not found");
    }
    return this.sanitizeUser(updated);
  }
}
