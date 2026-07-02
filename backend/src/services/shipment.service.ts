import {
  ShipmentMongoRepository,
  ShipmentStats,
} from "../repositories/shipment.repository";
import { CreateShipmentDTO, AdminUpdateShipmentDTO } from "../dtos/shipment.dto";
import { IShipment } from "../models/shipment.model";
import { ShipmentStatus } from "../types/shipment.type";
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
  amount: number;
  status: IShipment["status"];
  assignedDriver: string | null;
  createdAt: Date;
  updatedAt: Date;
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
      amount: shipment.amount,
      status: shipment.status,
      assignedDriver: shipment.assignedDriver ?? null,
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

    const updated = await shipmentRepository.update(id, data);
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
}
