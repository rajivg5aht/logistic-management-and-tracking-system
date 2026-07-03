import { ShipmentModel, IShipment } from "../models/shipment.model";
import { ShipmentStatus } from "../types/shipment.type";

export interface ShipmentStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  deliveredToday: number;
  pendingCodAmount: number;
}

export interface IShipmentRepository {
  create(data: Partial<IShipment>): Promise<IShipment>;
  getById(id: string): Promise<IShipment | null>;
  getAll(): Promise<IShipment[]>;
  update(id: string, data: Partial<IShipment>): Promise<IShipment | null>;
  delete(id: string): Promise<boolean>;

  getByCustomer(customerId: string): Promise<IShipment[]>;
  getPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: ShipmentStatus,
  ): Promise<{ shipments: IShipment[]; total: number }>;
  getStats(): Promise<ShipmentStats>;
}

export class ShipmentMongoRepository implements IShipmentRepository {
  async create(data: Partial<IShipment>): Promise<IShipment> {
    return ShipmentModel.create(data);
  }

  async getById(id: string): Promise<IShipment | null> {
    return ShipmentModel.findById(id);
  }

  async getAll(): Promise<IShipment[]> {
    return ShipmentModel.find().sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IShipment>): Promise<IShipment | null> {
    return ShipmentModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await ShipmentModel.findByIdAndDelete(id);
    return !!deleted;
  }

  async getByCustomer(customerId: string): Promise<IShipment[]> {
    return ShipmentModel.find({ customer: customerId }).sort({ createdAt: -1 });
  }

  async getPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: ShipmentStatus,
  ): Promise<{ shipments: IShipment[]; total: number }> {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [
        { trackingId: regex },
        { "pickup.fullName": regex },
        { "delivery.recipientName": regex },
        { "delivery.city": regex },
        { assignedDriver: regex },
      ];
    }

    const total = await ShipmentModel.countDocuments(query);
    const shipments = await ShipmentModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { shipments, total };
  }

  async getStats(): Promise<ShipmentStats> {
    // Nepal uses UTC+05:45 year-round. Convert today's Nepal boundaries to UTC
    // before querying MongoDB so "Delivered Today" is accurate for local users.
    const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
    const nowInNepal = new Date(Date.now() + nepalOffsetMs);
    const startOfToday = new Date(
      Date.UTC(
        nowInNepal.getUTCFullYear(),
        nowInNepal.getUTCMonth(),
        nowInNepal.getUTCDate(),
      ) - nepalOffsetMs,
    );
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [
      total,
      pending,
      inTransit,
      delivered,
      cancelled,
      deliveredToday,
      pendingCodTotals,
    ] = await Promise.all([
      ShipmentModel.countDocuments({}),
      ShipmentModel.countDocuments({ status: "pending" }),
      ShipmentModel.countDocuments({ status: "in-transit" }),
      ShipmentModel.countDocuments({ status: "delivered" }),
      ShipmentModel.countDocuments({ status: "cancelled" }),
      ShipmentModel.countDocuments({
        status: "delivered",
        $or: [
          { deliveredAt: { $gte: startOfToday, $lt: startOfTomorrow } },
          {
            deliveredAt: null,
            updatedAt: { $gte: startOfToday, $lt: startOfTomorrow },
          },
        ],
      }),
      ShipmentModel.aggregate<{ total: number }>([
        {
          $match: {
            paymentMethod: "cod",
            paymentStatus: "pending",
            status: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return {
      total,
      pending,
      inTransit,
      delivered,
      cancelled,
      deliveredToday,
      pendingCodAmount: pendingCodTotals[0]?.total ?? 0,
    };
  }
}
