import { ShipmentMongoRepository } from "../repositories/shipment.repository";
import { DriverLocationMongoRepository } from "../repositories/driverLocation.repository";
import { IDriverLocation } from "../models/driverLocation.model";
import { HttpException } from "../exceptions/http-exception";
import { DriverStage, ShipmentStatus } from "../types/shipment.type";

const shipmentRepository = new ShipmentMongoRepository();
const driverLocationRepository = new DriverLocationMongoRepository();

export interface TrackingUser {
  id: string;
  role: string;
}

export interface DriverLocationPayload {
  shipmentId: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  updatedAt?: string | number | Date;
}

export interface SafeDriverLocation {
  shipmentId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  isLive: boolean;
  startedAt: Date | null;
  stoppedAt: Date | null;
  updatedAt: Date;
}

export interface DriverTrackingStatus {
  shipmentId: string;
  driverId: string;
  isLive: boolean;
  updatedAt: Date;
}

const TERMINAL_STATUSES: ShipmentStatus[] = ["delivered", "cancelled"];
const TERMINAL_STAGES: DriverStage[] = ["delivered", "failed", "returned"];

export class TrackingService {
  private sanitize(location: IDriverLocation): SafeDriverLocation {
    return {
      shipmentId: location.shipmentId.toString(),
      driverId: location.driverId.toString(),
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy ?? null,
      speed: location.speed ?? null,
      heading: location.heading ?? null,
      isLive: location.isLive ?? false,
      startedAt: location.startedAt ?? null,
      stoppedAt: location.stoppedAt ?? null,
      updatedAt: location.updatedAt,
    };
  }

  private toFiniteOrNull(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  async assertCanRead(user: TrackingUser, shipmentId: string): Promise<void> {
    const shipment = await shipmentRepository.getById(shipmentId);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }

    if (user.role === "admin") return;

    if (user.role === "customer") {
      if (shipment.customer?.toString() !== user.id) {
        throw new HttpException(403, "You cannot track this shipment");
      }
      return;
    }

    if (user.role === "driver") {
      if (shipment.assignedDriverId?.toString() !== user.id) {
        throw new HttpException(403, "This shipment is not assigned to you");
      }
      return;
    }

    throw new HttpException(403, "You cannot track this shipment");
  }

  async saveDriverLocation(
    user: TrackingUser,
    payload: DriverLocationPayload,
  ): Promise<SafeDriverLocation> {
    if (user.role !== "driver") {
      throw new HttpException(403, "Only drivers can send location updates");
    }

    const latitude = this.toFiniteOrNull(payload?.latitude);
    const longitude = this.toFiniteOrNull(payload?.longitude);
    if (
      latitude === null ||
      longitude === null ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new HttpException(400, "Invalid coordinates");
    }

    const shipment = await shipmentRepository.getById(payload.shipmentId);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }
    if (shipment.assignedDriverId?.toString() !== user.id) {
      throw new HttpException(403, "This shipment is not assigned to you");
    }
    if (TERMINAL_STATUSES.includes(shipment.status as ShipmentStatus)) {
      throw new HttpException(409, "This shipment is no longer active");
    }
    if (
      shipment.driverStage &&
      TERMINAL_STAGES.includes(shipment.driverStage as DriverStage)
    ) {
      throw new HttpException(409, "This delivery is already completed");
    }

    const updatedAt = new Date();
    const location = await driverLocationRepository.upsert(payload.shipmentId, {
      driverId: user.id,
      latitude,
      longitude,
      accuracy: this.toFiniteOrNull(payload.accuracy),
      speed: this.toFiniteOrNull(payload.speed),
      heading: this.toFiniteOrNull(payload.heading),
      isLive: true,
      startedAt: updatedAt,
      stoppedAt: null,
      updatedAt,
    });

    await shipmentRepository.update(payload.shipmentId, {
      currentLocation: { latitude, longitude, updatedAt },
    });

    return this.sanitize(location);
  }

  async stopDriverLocation(
    user: TrackingUser,
    shipmentId: string,
  ): Promise<DriverTrackingStatus> {
    if (user.role !== "driver") {
      throw new HttpException(403, "Only drivers can stop location updates");
    }

    const shipment = await shipmentRepository.getById(shipmentId);
    if (!shipment) {
      throw new HttpException(404, "Shipment not found");
    }
    if (shipment.assignedDriverId?.toString() !== user.id) {
      throw new HttpException(403, "This shipment is not assigned to you");
    }

    const stoppedAt = new Date();
    await driverLocationRepository.setLiveStatus(
      shipmentId,
      user.id,
      false,
      stoppedAt,
    );
    await shipmentRepository.update(shipmentId, { currentLocation: null });

    return {
      shipmentId,
      driverId: user.id,
      isLive: false,
      updatedAt: stoppedAt,
    };
  }

  async getLatestLocation(
    shipmentId: string,
  ): Promise<SafeDriverLocation | null> {
    const location = await driverLocationRepository.getByShipment(shipmentId);
    if (!location || !location.isLive) return null;
    return this.sanitize(location);
  }
}
