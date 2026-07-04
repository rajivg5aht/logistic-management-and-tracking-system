import {
  ShipmentMongoRepository,
  ShipmentStats,
  DriverStats,
} from "../repositories/shipment.repository";
import {
  CreateShipmentDTO,
  AdminUpdateShipmentDTO,
  CustomerUpdateShipmentDTO,
} from "../dtos/shipment.dto";
import { DriverStageUpdateDTO } from "../dtos/driver.dto";
import { IShipment } from "../models/shipment.model";
import { UserModel } from "../models/user.model";
import { ShipmentStatus, DriverStage } from "../types/shipment.type";
import { HttpException } from "../exceptions/http-exception";

const shipmentRepository = new ShipmentMongoRepository();

export type SafeShipment = {
  id: string;
  trackingId: string;
  customer: string;
  pickup: IShipment["pickup"];
  delivery: IShipment["delivery"];
  package: IShipment["package"];
  service: IShipment["service"];
  insurance: boolean;
  specialHandling: boolean;
  paymentMethod: IShipment["paymentMethod"];
  paymentStatus: IShipment["paymentStatus"];
  deliveredAt: Date | null;
  amount: number;
  status: IShipment["status"];
  assignedDriver: string | null;
  assignedDriverId: string | null;
  driverStage: DriverStage | null;
  timeline: IShipment["timeline"];
  createdAt: Date;
  updatedAt: Date;
};

// A driver's granular stage maps onto the canonical 4-state status that the
// KPIs, 7-day chart, customer badges and filters all depend on. Keeping this in
// one place means the rest of the app never needs to know about driver stages.
const STAGE_TO_STATUS: Record<DriverStage, ShipmentStatus> = {
  assigned: "pending",
  "picked-up": "in-transit",
  "in-transit": "in-transit",
  "out-for-delivery": "in-transit",
  delivered: "delivered",
  failed: "in-transit",
  returned: "cancelled",
};

// Allowed forward transitions for a driver-driven delivery.
const STAGE_TRANSITIONS: Record<DriverStage, DriverStage[]> = {
  assigned: ["picked-up", "failed"],
  "picked-up": ["in-transit", "failed"],
  "in-transit": ["out-for-delivery", "failed"],
  "out-for-delivery": ["delivered", "failed"],
  delivered: [],
  failed: ["picked-up", "returned"],
  returned: [],
};

export class ShipmentService {
  private sanitize(shipment: IShipment): SafeShipment {
    return {
      id: shipment._id.toString(),
      trackingId: shipment.trackingId,
      customer: shipment.customer?.toString(),
      pickup: shipment.pickup,
      delivery: shipment.delivery,
      package: shipment.package,
      service: shipment.service,
      insurance: shipment.insurance,
      specialHandling: shipment.specialHandling,
      paymentMethod: shipment.paymentMethod,
      paymentStatus: shipment.paymentStatus,
      deliveredAt: shipment.deliveredAt ?? null,
      amount: shipment.amount,
      status: shipment.status,
      assignedDriver: shipment.assignedDriver ?? null,
      assignedDriverId: shipment.assignedDriverId?.toString() ?? null,
      driverStage: (shipment.driverStage as DriverStage) ?? null,
      timeline: shipment.timeline ?? [],
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  }

  // Generates a unique, human-friendly tracking id like "LN-482913".
  private async generateTrackingId(): Promise<string> {
    for (let attempt = 0; attempt < 6; attempt++) {
      const candidate = `LN-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await shipmentRepository.getPaginated(1, 1, candidate);
      if (existing.total === 0) return candidate;
    }
    // Fallback that is effectively collision-proof.
    return `LN-${Date.now().toString().slice(-6)}`;
  }

  async createShipment(
    customerId: string,
    data: CreateShipmentDTO,
  ): Promise<SafeShipment> {
    const trackingId = await this.generateTrackingId();

    // Wallet payments are captured up front; COD is settled on delivery.
    const paymentStatus = data.paymentMethod === "cod" ? "pending" : "paid";

    const shipment = await shipmentRepository.create({
      ...data,
      trackingId,
      customer: customerId as any,
      paymentStatus,
      status: "pending",
      assignedDriver: null,
    });

    return this.sanitize(shipment);
  }

  async getMyShipments(customerId: string): Promise<SafeShipment[]> {
    const shipments = await shipmentRepository.getByCustomer(customerId);
    return shipments.map((s) => this.sanitize(s));
  }

  // Fetches a shipment and guarantees it belongs to the requesting customer.
  // Prevents one customer from reading or mutating another's shipment.
  private async getOwnedShipment(
    customerId: string,
    id: string,
  ): Promise<IShipment> {
    const shipment = await shipmentRepository.getById(id);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }
    if (shipment.customer?.toString() !== customerId) {
      throw new HttpException(
        403,
        "You do not have permission to modify this shipment",
      );
    }
    return shipment;
  }

  // Customer edits are only permitted while a shipment is still pending
  // (i.e. it has not been picked up or dispatched yet).
  async customerUpdateShipment(
    customerId: string,
    id: string,
    data: CustomerUpdateShipmentDTO,
  ): Promise<SafeShipment> {
    const shipment = await this.getOwnedShipment(customerId, id);
    if (shipment.status !== "pending") {
      throw new HttpException(
        409,
        "Only pending shipments can be edited. This shipment is already " +
          shipment.status,
      );
    }

    const updated = await shipmentRepository.update(
      id,
      data as Partial<IShipment>,
    );
    if (!updated) {
      throw new HttpException(500, "Failed to update shipment");
    }
    return this.sanitize(updated);
  }

  // Cancellation is allowed while pending; once in transit or delivered the
  // customer must go through support so the operational record stays intact.
  async customerCancelShipment(
    customerId: string,
    id: string,
  ): Promise<SafeShipment> {
    const shipment = await this.getOwnedShipment(customerId, id);
    if (shipment.status === "cancelled") {
      throw new HttpException(409, "This shipment is already cancelled");
    }
    if (shipment.status !== "pending") {
      throw new HttpException(
        409,
        "Only pending shipments can be cancelled. Please contact support for shipments already in transit.",
      );
    }

    const updated = await shipmentRepository.update(id, { status: "cancelled" });
    if (!updated) {
      throw new HttpException(500, "Failed to cancel shipment");
    }
    return this.sanitize(updated);
  }

  // Permanent deletion is limited to cancelled shipments so delivered and
  // in-transit records can never be erased by a customer.
  async customerDeleteShipment(
    customerId: string,
    id: string,
  ): Promise<boolean> {
    const shipment = await this.getOwnedShipment(customerId, id);
    if (shipment.status !== "cancelled") {
      throw new HttpException(
        409,
        "Only cancelled shipments can be deleted. Cancel the shipment first.",
      );
    }
    return shipmentRepository.delete(id);
  }

  async adminGetShipments(
    page: number,
    limit: number,
    search?: string,
    status?: ShipmentStatus,
  ): Promise<{ shipments: SafeShipment[]; total: number }> {
    const { shipments, total } = await shipmentRepository.getPaginated(
      page,
      limit,
      search,
      status,
    );

    return {
      shipments: shipments.map((s) => this.sanitize(s)),
      total,
    };
  }

  async adminGetShipmentById(id: string): Promise<SafeShipment> {
    const shipment = await shipmentRepository.getById(id);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }
    return this.sanitize(shipment);
  }

  async adminUpdateShipment(
    id: string,
    data: AdminUpdateShipmentDTO,
  ): Promise<SafeShipment> {
    const shipment = await shipmentRepository.getById(id);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }

    const { assignedDriverId, ...rest } = data;
    const updateData: Partial<IShipment> = { ...rest };

    if (data.status === "delivered" && shipment.status !== "delivered") {
      updateData.deliveredAt = new Date();
    } else if (data.status && data.status !== "delivered") {
      updateData.deliveredAt = null;
    }

    // Driver assignment: link the real account, denormalize the name, and start
    // the delivery timeline at "assigned".
    if (assignedDriverId !== undefined) {
      const previousDriverId = shipment.assignedDriverId?.toString() ?? null;

      if (assignedDriverId) {
        const driver = await UserModel.findById(assignedDriverId);
        if (!driver || driver.role !== "driver") {
          throw new HttpException(400, "Selected driver was not found");
        }

        updateData.assignedDriverId = driver._id;
        updateData.assignedDriver = driver.fullName;

        // Only (re)initialise the stage when the driver actually changes.
        if (previousDriverId !== assignedDriverId) {
          updateData.driverStage = "assigned";
          updateData.timeline = [
            ...(shipment.timeline ?? []),
            { stage: "assigned", at: new Date(), note: "Assigned to driver" },
          ];
          await UserModel.findByIdAndUpdate(driver._id, {
            availabilityStatus: "assigned",
          });
        }
      } else {
        // Clearing the assignment.
        updateData.assignedDriverId = null;
        updateData.assignedDriver = null;
        updateData.driverStage = null;
        if (previousDriverId) {
          await UserModel.findByIdAndUpdate(previousDriverId, {
            availabilityStatus: "available",
          });
        }
      }
    }

    const updated = await shipmentRepository.update(id, updateData);
    if (!updated) {
      throw new HttpException(500, "Failed to update shipment");
    }

    return this.sanitize(updated);
  }

  async adminDeleteShipment(id: string): Promise<boolean> {
    const shipment = await shipmentRepository.getById(id);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }
    return shipmentRepository.delete(id);
  }

  async getStats(): Promise<ShipmentStats> {
    return shipmentRepository.getStats();
  }

  // ── Driver console ─────────────────────────────────────────────────────────
  async getMyAssignments(
    driverId: string,
    scope?: "active" | "history",
  ): Promise<SafeShipment[]> {
    const shipments = await shipmentRepository.getByDriver(driverId, scope);
    return shipments.map((s) => this.sanitize(s));
  }

  // Fetches an assignment and guarantees it belongs to the requesting driver.
  private async getOwnedAssignment(
    driverId: string,
    id: string,
  ): Promise<IShipment> {
    const shipment = await shipmentRepository.getById(id);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }
    if (shipment.assignedDriverId?.toString() !== driverId) {
      throw new HttpException(
        403,
        "This shipment is not assigned to you",
      );
    }
    return shipment;
  }

  async getMyAssignmentById(
    driverId: string,
    id: string,
  ): Promise<SafeShipment> {
    const shipment = await this.getOwnedAssignment(driverId, id);
    return this.sanitize(shipment);
  }

  // Driver advances the delivery stage. Validates the transition, appends a
  // timeline entry, and syncs the canonical status + the driver's availability.
  async driverUpdateStage(
    driverId: string,
    id: string,
    data: DriverStageUpdateDTO,
  ): Promise<SafeShipment> {
    const shipment = await this.getOwnedAssignment(driverId, id);
    const current: DriverStage = (shipment.driverStage as DriverStage) ?? "assigned";
    const next = data.stage;

    if (next !== current) {
      const allowed = STAGE_TRANSITIONS[current] ?? [];
      if (!allowed.includes(next)) {
        throw new HttpException(
          409,
          `Cannot move from "${current}" to "${next}".`,
        );
      }
    }

    const nextStatus = STAGE_TO_STATUS[next];
    const updateData: Partial<IShipment> = {
      driverStage: next,
      status: nextStatus,
      timeline: [
        ...(shipment.timeline ?? []),
        { stage: next, at: new Date(), note: data.note ?? "" },
      ],
    };

    if (next === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const updated = await shipmentRepository.update(id, updateData);
    if (!updated) {
      throw new HttpException(500, "Failed to update delivery stage");
    }

    // Keep the driver's availability in step with what they're doing.
    let availability: string | null = null;
    if (["picked-up", "in-transit", "out-for-delivery"].includes(next)) {
      availability = "on-delivery";
    } else if (["delivered", "returned"].includes(next)) {
      availability = "available";
    }
    if (availability) {
      await UserModel.findByIdAndUpdate(driverId, {
        availabilityStatus: availability,
      });
    }

    return this.sanitize(updated);
  }

  async getDriverStats(driverId: string): Promise<DriverStats> {
    return shipmentRepository.getDriverStats(driverId);
  }
}
