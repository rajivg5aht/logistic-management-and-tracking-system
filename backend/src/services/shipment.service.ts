import mongoose from "mongoose";
import {
  ShipmentMongoRepository,
  ShipmentStats,
  DriverStats,
  ShipmentAnalytics,
} from "../repositories/shipment.repository";
import {
  CreateShipmentDTO,
  AdminUpdateShipmentDTO,
  CustomerUpdateShipmentDTO,
} from "../dtos/shipment.dto";
import { DriverProofUpdateDTO, DriverStageUpdateDTO } from "../dtos/driver.dto";
import { IShipment, ShipmentModel } from "../models/shipment.model";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";
import {
  DriverStage,
  ShipmentStatus,
  CUSTOMER_HISTORY_STATUSES,
  DRIVER_STAGE_TO_SHIPMENT_STATUS,
  SHIPMENT_STATUS_TO_DRIVER_STAGE,
} from "../types/shipment.type";
import { HttpException } from "../exceptions/http-exception";
import { PaymentService } from "./payment.service";
import { emitShipmentUpdated } from "../socket";

const shipmentRepository = new ShipmentMongoRepository();
const paymentService = new PaymentService();

export type SafeProofOfDelivery = {
  photoUrl: string | null;
  signatureUrl: string | null;
  notes: string;
  recipientName: string;
  confirmedAt: Date | null;
  confirmedByDriverId: string | null;
  updatedAt: Date | null;
};

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
  proofOfDelivery: SafeProofOfDelivery | null;
  amount: number;
  status: IShipment["status"];
  assignedDriver: string | null;
  assignedDriverId: string | null;
  assignedVehicle: string | null;
  assignedVehicleId: string | null;
  driverStage: DriverStage | null;
  currentLocation: IShipment["currentLocation"];
  timeline: IShipment["timeline"];
  createdAt: Date;
  updatedAt: Date;
};

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
  private sanitizeProof(
    proof: IShipment["proofOfDelivery"],
  ): SafeProofOfDelivery | null {
    if (!proof) return null;
    return {
      photoUrl: proof.photoUrl ?? null,
      signatureUrl: proof.signatureUrl ?? null,
      notes: proof.notes ?? "",
      recipientName: proof.recipientName ?? "",
      confirmedAt: proof.confirmedAt ?? null,
      confirmedByDriverId: proof.confirmedByDriverId?.toString() ?? null,
      updatedAt: proof.updatedAt ?? null,
    };
  }

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
      proofOfDelivery: this.sanitizeProof(shipment.proofOfDelivery),
      amount: shipment.amount,
      status: shipment.status,
      assignedDriver: shipment.assignedDriver ?? null,
      assignedDriverId: shipment.assignedDriverId?.toString() ?? null,
      assignedVehicle: shipment.assignedVehicle ?? null,
      assignedVehicleId: shipment.assignedVehicleId?.toString() ?? null,
      driverStage: (shipment.driverStage as DriverStage) ?? null,
      currentLocation: shipment.currentLocation ?? null,
      timeline: shipment.timeline ?? [],
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  }

  private async generateTrackingId(): Promise<string> {
    for (let attempt = 0; attempt < 6; attempt++) {
      const candidate = `LN-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await shipmentRepository.getPaginated(1, 1, candidate);
      if (existing.total === 0) return candidate;
    }
    return `LN-${Date.now().toString().slice(-6)}`;
  }

  async createShipment(
    customerId: string,
    data: CreateShipmentDTO,
  ): Promise<SafeShipment> {
    const trackingId = await this.generateTrackingId();

    const paymentStatus = data.paymentMethod === "cod" ? "pending" : "paid";

    const shipment = await shipmentRepository.create({
      ...data,
      trackingId,
      customer: customerId as any,
      paymentStatus,
      status: "pending",
      assignedDriver: null,
      assignedVehicle: null,
    });

    await paymentService.createChargeForShipment(shipment);

    return this.sanitize(shipment);
  }

  async getMyShipments(customerId: string): Promise<SafeShipment[]> {
    const shipments = await shipmentRepository.getByCustomer(customerId);
    return shipments.map((s) => this.sanitize(s));
  }

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
    await paymentService.cancelPendingCharge(id);
    if (shipment.assignedDriverId) {
      await UserModel.findByIdAndUpdate(shipment.assignedDriverId, {
        availabilityStatus: "available",
      });
    }
    return this.sanitize(updated);
  }

  async customerDeleteShipment(
    customerId: string,
    id: string,
  ): Promise<boolean> {
    const shipment = await this.getOwnedShipment(customerId, id);
    if (
      !CUSTOMER_HISTORY_STATUSES.includes(
        shipment.status as (typeof CUSTOMER_HISTORY_STATUSES)[number],
      )
    ) {
      throw new HttpException(
        409,
        "Only delivered or cancelled shipments can be deleted from history.",
      );
    }
    return shipmentRepository.delete(id);
  }

  async customerDeleteHistory(customerId: string): Promise<number> {
    const result = await ShipmentModel.deleteMany({
      customer: customerId,
      status: { $in: CUSTOMER_HISTORY_STATUSES },
    });
    return result.deletedCount;
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

    const {
      assignedDriverId,
      driverStage: requestedDriverStage,
      ...rest
    } = data;
    const updateData: Partial<IShipment> = { ...rest };
    const requestedStatus = requestedDriverStage
      ? DRIVER_STAGE_TO_SHIPMENT_STATUS[requestedDriverStage]
      : data.status;

    if (requestedStatus) {
      updateData.status = requestedStatus;
    }

    if (requestedStatus === "delivered" && shipment.status !== "delivered") {
      if (
        !shipment.proofOfDelivery?.confirmedAt ||
        !shipment.proofOfDelivery.photoUrl
      ) {
        throw new HttpException(
          400,
          "Upload proof of delivery before marking this shipment delivered",
        );
      }
      updateData.deliveredAt = new Date();
    } else if (requestedStatus && requestedStatus !== "delivered") {
      updateData.deliveredAt = null;
    }

    if (assignedDriverId !== undefined) {
      const previousDriverId = shipment.assignedDriverId?.toString() ?? null;

      if (assignedDriverId) {
        const driver = await UserModel.findById(assignedDriverId);
        if (!driver || driver.role !== "driver") {
          throw new HttpException(400, "Selected driver was not found");
        }
        if (driver.status !== "active") {
          throw new HttpException(400, "Inactive drivers cannot receive shipments");
        }
        if (!driver.phoneNumber || !driver.licenseNumber) {
          throw new HttpException(
            400,
            "Complete the driver's phone and license details before assignment",
          );
        }
        if (previousDriverId !== assignedDriverId) {
          const activeAssignment = await ShipmentModel.findOne({
            _id: { $ne: shipment._id },
            assignedDriverId: driver._id,
            status: { $nin: ["delivered", "cancelled"] },
          });
          if (activeAssignment) {
            throw new HttpException(
              400,
              "This driver already has an active shipment",
            );
          }
          if (driver.availabilityStatus !== "available") {
            throw new HttpException(
              400,
              "Only available drivers can receive shipments",
            );
          }
        }

        updateData.assignedDriverId = driver._id;
        updateData.assignedDriver = driver.fullName;

        if (driver.assignedVehicleId) {
          const vehicle = await VehicleModel.findById(driver.assignedVehicleId);
          if (
            !vehicle ||
            vehicle.assignedDriverId?.toString() !== driver._id.toString() ||
            vehicle.status !== "active"
          ) {
            throw new HttpException(
              400,
              "The driver's vehicle assignment is invalid",
            );
          }
          updateData.assignedVehicleId = vehicle._id;
          updateData.assignedVehicle = vehicle.registrationNumber;
        } else {
          updateData.assignedVehicleId = null;
          updateData.assignedVehicle = null;
        }

        if (previousDriverId !== assignedDriverId) {
          updateData.driverStage = "assigned";
          updateData.timeline = [
            ...(shipment.timeline ?? []),
            { stage: "assigned", at: new Date(), note: "Assigned to driver" },
          ];
          await UserModel.findByIdAndUpdate(driver._id, {
            availabilityStatus: "assigned",
          });
          if (previousDriverId) {
            await UserModel.findByIdAndUpdate(previousDriverId, {
              availabilityStatus: "available",
            });
          }
        }
      } else {
        updateData.assignedDriverId = null;
        updateData.assignedDriver = null;
        updateData.assignedVehicleId = null;
        updateData.assignedVehicle = null;
        updateData.driverStage = null;
        if (previousDriverId) {
          await UserModel.findByIdAndUpdate(previousDriverId, {
            availabilityStatus: "available",
          });
        }
      }
    }

    const effectiveDriverId =
      assignedDriverId === undefined
        ? shipment.assignedDriverId?.toString() ?? null
        : assignedDriverId || null;
    const effectiveStatus = updateData.status ?? shipment.status;
    let plannedStage =
      (updateData.driverStage as DriverStage | null | undefined) ??
      (shipment.driverStage as DriverStage | null);

    if (requestedDriverStage) {
      if (!effectiveDriverId) {
        throw new HttpException(
          400,
          "Assign a driver before updating the delivery status",
        );
      }

      if (plannedStage !== requestedDriverStage) {
        updateData.driverStage = requestedDriverStage;
        updateData.timeline = [
          ...((updateData.timeline ?? shipment.timeline) || []),
          {
            stage: requestedDriverStage,
            at: new Date(),
            note: "Delivery status updated by admin",
          },
        ];
        plannedStage = requestedDriverStage;
      }
    }

    if (
      effectiveDriverId &&
      (!plannedStage ||
        DRIVER_STAGE_TO_SHIPMENT_STATUS[plannedStage] !== effectiveStatus)
    ) {
      const syncedStage = SHIPMENT_STATUS_TO_DRIVER_STAGE[effectiveStatus];
      updateData.driverStage = syncedStage;
      updateData.timeline = [
        ...((updateData.timeline ?? shipment.timeline) || []),
        {
          stage: syncedStage,
          at: new Date(),
          note: "Shipment status updated by admin",
        },
      ];
    }

    if (effectiveDriverId) {
      const availabilityStatus =
        effectiveStatus === "pending"
          ? "assigned"
          : effectiveStatus === "in-transit"
            ? "on-delivery"
            : "available";
      await UserModel.findByIdAndUpdate(effectiveDriverId, {
        availabilityStatus,
      });
    }

    const updated = await shipmentRepository.update(id, updateData);
    if (!updated) {
      throw new HttpException(500, "Failed to update shipment");
    }

    if (updateData.status === "cancelled" && shipment.status !== "cancelled") {
      await paymentService.cancelPendingCharge(id);
    }

    const safe = this.sanitize(updated);
    emitShipmentUpdated(safe);
    return safe;
  }

  async adminDeleteShipment(id: string): Promise<boolean> {
    const shipment = await shipmentRepository.getById(id);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }
    if (
      shipment.assignedDriverId &&
      !["delivered", "cancelled"].includes(shipment.status)
    ) {
      await UserModel.findByIdAndUpdate(shipment.assignedDriverId, {
        availabilityStatus: "available",
      });
    }
    return shipmentRepository.delete(id);
  }

  async getStats(): Promise<ShipmentStats> {
    return shipmentRepository.getStats();
  }

  async getAnalytics(): Promise<ShipmentAnalytics> {
    return shipmentRepository.getAnalytics();
  }

  async getMyAssignments(
    driverId: string,
    scope?: "active" | "history",
  ): Promise<SafeShipment[]> {
    const shipments = await shipmentRepository.getByDriver(driverId, scope);
    return shipments.map((s) => this.sanitize(s));
  }

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

    if (next === current) {
      return this.sanitize(shipment);
    }

    if (
      next === "delivered" &&
      shipment.paymentMethod === "cod" &&
      shipment.paymentStatus === "pending"
    ) {
      throw new HttpException(
        400,
        "Collect the COD payment before marking this shipment delivered",
      );
    }

    if (
      next === "delivered" &&
      (!shipment.proofOfDelivery?.confirmedAt ||
        !shipment.proofOfDelivery.photoUrl)
    ) {
      throw new HttpException(
        400,
        "Upload proof of delivery before marking this shipment delivered",
      );
    }

    const nextStatus = DRIVER_STAGE_TO_SHIPMENT_STATUS[next];
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

    const safe = this.sanitize(updated);
    emitShipmentUpdated(safe);
    return safe;
  }

  async driverUpsertProof(
    driverId: string,
    id: string,
    data: DriverProofUpdateDTO & { photoUrl?: string; signatureUrl?: string },
  ): Promise<SafeShipment> {
    const shipment = await this.getOwnedAssignment(driverId, id);
    if (shipment.status === "cancelled") {
      throw new HttpException(409, "Cancelled shipments cannot receive proof");
    }

    const existing = shipment.proofOfDelivery;
    const notes =
      data.notes !== undefined ? data.notes.trim() : existing?.notes ?? "";
    const recipientName =
      data.recipientName !== undefined
        ? data.recipientName.trim()
        : existing?.recipientName || shipment.delivery.recipientName || "";
    const photoUrl = data.photoUrl ?? existing?.photoUrl ?? null;
    const signatureUrl = data.signatureUrl ?? existing?.signatureUrl ?? null;

    if (!photoUrl) {
      throw new HttpException(
        400,
        "Upload a proof photo before saving proof",
      );
    }

    const now = new Date();
    const updated = await shipmentRepository.update(id, {
      proofOfDelivery: {
        photoUrl,
        signatureUrl,
        notes,
        recipientName,
        confirmedAt: existing?.confirmedAt ?? now,
        confirmedByDriverId: new mongoose.Types.ObjectId(driverId),
        updatedAt: now,
      },
    } as Partial<IShipment>);
    if (!updated) {
      throw new HttpException(500, "Failed to save proof of delivery");
    }
    const safe = this.sanitize(updated);
    emitShipmentUpdated(safe);
    return safe;
  }

  async driverDeleteProof(driverId: string, id: string): Promise<SafeShipment> {
    const shipment = await this.getOwnedAssignment(driverId, id);
    if (shipment.status === "delivered") {
      throw new HttpException(
        409,
        "Delivered shipments must keep their proof of delivery record",
      );
    }

    const updated = await shipmentRepository.update(id, {
      proofOfDelivery: null,
    } as Partial<IShipment>);
    if (!updated) {
      throw new HttpException(500, "Failed to remove proof of delivery");
    }
    return this.sanitize(updated);
  }

  async driverCollectCod(
    driverId: string,
    id: string,
    collected: boolean,
  ): Promise<SafeShipment> {
    const shipment = await this.getOwnedAssignment(driverId, id);
    if (shipment.paymentMethod !== "cod") {
      throw new HttpException(400, "This shipment is not cash on delivery");
    }

    const nextStatus = collected ? "paid" : "pending";
    if (shipment.paymentStatus === nextStatus) {
      return this.sanitize(shipment);
    }

    const updated = await shipmentRepository.update(id, {
      paymentStatus: nextStatus,
    });
    if (!updated) {
      throw new HttpException(500, "Failed to update payment status");
    }

    await paymentService.recordCodCollection(id, driverId, collected);

    return this.sanitize(updated);
  }

  async getDriverStats(driverId: string): Promise<DriverStats> {
    return shipmentRepository.getDriverStats(driverId);
  }
}
