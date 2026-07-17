import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../configs/constant";
import { IUser, UserModel } from "../../models/user.model";
import { IVehicle, VehicleModel } from "../../models/vehicle.model";
import { IShipment, ShipmentModel } from "../../models/shipment.model";

let counter = 0;

const unique = (): string => {
  counter += 1;
  return `${Date.now().toString(36)}${counter}`;
};

export const uniqueEmail = (prefix = "user"): string =>
  `${prefix}-${unique()}@example.com`;

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const signToken = (user: IUser): string =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: "30d" },
  );

export interface SeededUser {
  user: IUser;
  token: string;
  password: string;
}

interface SeedUserOptions {
  role?: "admin" | "customer" | "driver";
  password?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  status?: "active" | "inactive";
  licenseNumber?: string;
  availabilityStatus?: IUser["availabilityStatus"];
  assignedVehicleId?: IVehicle["_id"] | null;
}

export async function seedUser(options: SeedUserOptions = {}): Promise<SeededUser> {
  const role = options.role ?? "customer";
  const password = options.password ?? "secret123";
  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = await UserModel.create({
    fullName: options.fullName ?? "Test User",
    email: options.email ?? uniqueEmail(role),
    phoneNumber: options.phoneNumber ?? "9800000000",
    password: hashedPassword,
    role,
    status: options.status ?? "active",
    licenseNumber:
      options.licenseNumber ?? (role === "driver" ? `LIC-${unique()}` : ""),
    availabilityStatus:
      options.availabilityStatus ?? (role === "driver" ? "available" : undefined),
    assignedVehicleId: options.assignedVehicleId ?? null,
  });

  return { user, token: signToken(user), password };
}

export const seedAdmin = (options: SeedUserOptions = {}) =>
  seedUser({ ...options, role: "admin" });

export const seedCustomer = (options: SeedUserOptions = {}) =>
  seedUser({ ...options, role: "customer" });

export const seedDriver = (options: SeedUserOptions = {}) =>
  seedUser({ ...options, role: "driver" });

interface SeedVehicleOptions {
  type?: IVehicle["type"];
  status?: IVehicle["status"];
  make?: string;
  vehicleModel?: string;
  assignedDriverId?: IVehicle["_id"] | null;
}

export async function seedVehicle(options: SeedVehicleOptions = {}): Promise<IVehicle> {
  return VehicleModel.create({
    registrationNumber: `BA-${unique()}`,
    type: options.type ?? "van",
    make: options.make ?? "Toyota",
    vehicleModel: options.vehicleModel ?? "HiAce",
    status: options.status ?? "available",
    assignedDriverId: options.assignedDriverId ?? null,
  });
}

export const validShipmentPayload = (overrides: Record<string, unknown> = {}) => ({
  pickup: {
    fullName: "Sender Name",
    phoneNumber: "9800000001",
    streetAddress: "123 Pickup Street",
    city: "Kathmandu",
    district: "Kathmandu",
  },
  delivery: {
    recipientName: "Recipient Name",
    phoneNumber: "9800000002",
    streetAddress: "456 Delivery Road",
    city: "Lalitpur",
    district: "Lalitpur",
  },
  package: {
    parcelType: "standard" as const,
    weight: "2",
    quantity: 1,
  },
  service: "standard" as const,
  paymentMethod: "cod" as const,
  amount: 500,
  ...overrides,
});

interface SeedShipmentOptions {
  customer: IUser["_id"];
  status?: IShipment["status"];
  paymentMethod?: IShipment["paymentMethod"];
  amount?: number;
  assignedDriverId?: IUser["_id"] | null;
}

export async function seedShipment(options: SeedShipmentOptions): Promise<IShipment> {
  return ShipmentModel.create({
    ...validShipmentPayload(),
    trackingId: `LN-${unique()}`,
    customer: options.customer,
    status: options.status ?? "pending",
    paymentMethod: options.paymentMethod ?? "cod",
    paymentStatus: "pending",
    amount: options.amount ?? 500,
    assignedDriverId: options.assignedDriverId ?? null,
  });
}
