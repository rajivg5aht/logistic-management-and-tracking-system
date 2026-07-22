import mongoose from "mongoose";
import { ShipmentModel, IShipment } from "../models/shipment.model";
import { ShipmentStatus } from "../types/shipment.type";

export interface DailyVolume {
  date: string;
  label: string;
  count: number;
}

export interface ShipmentStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  deliveredToday: number;
  pendingCodAmount: number;
  dailyVolume: DailyVolume[];
}

export interface DriverStats {
  total: number;
  active: number;
  deliveredToday: number;
  completed: number;
  codToCollect: number;
}

export interface MonthlyRevenue {
  label: string;
  revenue: number;
}

export interface RegionVolume {
  region: string;
  count: number;
}

export interface ShipmentAnalytics {
  totalRevenue: number;
  revenueDelta: number;
  deliveries: number;
  deliveriesDelta: number;
  avgDeliveryMs: number | null;
  avgTimeDelta: number;
  successRate: number;
  successDelta: number;
  monthlyRevenue: MonthlyRevenue[];
  regionVolume: RegionVolume[];
  totalShipments: number;
}

export interface IShipmentRepository {
  create(data: Partial<IShipment>): Promise<IShipment>;
  getById(id: string): Promise<IShipment | null>;
  getAll(): Promise<IShipment[]>;
  update(id: string, data: Partial<IShipment>): Promise<IShipment | null>;
  delete(id: string): Promise<boolean>;

  getByCustomer(customerId: string): Promise<IShipment[]>;
  getByTrackingId(trackingId: string): Promise<IShipment | null>;
  getByDriver(
    driverId: string,
    scope?: "active" | "history",
  ): Promise<IShipment[]>;
  getPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: ShipmentStatus,
  ): Promise<{ shipments: IShipment[]; total: number }>;
  getStats(): Promise<ShipmentStats>;
  getDriverStats(driverId: string): Promise<DriverStats>;
  getAnalytics(): Promise<ShipmentAnalytics>;
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

  async getByTrackingId(trackingId: string): Promise<IShipment | null> {
    return ShipmentModel.findOne({ trackingId });
  }

  async getByDriver(
    driverId: string,
    scope?: "active" | "history",
  ): Promise<IShipment[]> {
    const query: any = { assignedDriverId: driverId };
    if (scope === "active") {
      query.status = { $in: ["pending", "in-transit"] };
    } else if (scope === "history") {
      query.status = { $in: ["delivered", "cancelled"] };
    }
    return ShipmentModel.find(query).sort({ updatedAt: -1 });
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
    const startOfWindow = new Date(
      startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000,
    );

    const [
      total,
      pending,
      inTransit,
      delivered,
      cancelled,
      deliveredToday,
      pendingCodTotals,
      dailyCounts,
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
      ShipmentModel.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: startOfWindow, $lt: startOfTomorrow } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "+05:45",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const countsByDate = new Map(dailyCounts.map((d) => [d._id, d.count]));
    const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyVolume: DailyVolume[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const dayInNepal = new Date(
        nowInNepal.getTime() - offset * 24 * 60 * 60 * 1000,
      );
      const year = dayInNepal.getUTCFullYear();
      const month = String(dayInNepal.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dayInNepal.getUTCDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;
      dailyVolume.push({
        date: key,
        label: WEEKDAYS[dayInNepal.getUTCDay()],
        count: countsByDate.get(key) ?? 0,
      });
    }

    return {
      total,
      pending,
      inTransit,
      delivered,
      cancelled,
      deliveredToday,
      pendingCodAmount: pendingCodTotals[0]?.total ?? 0,
      dailyVolume,
    };
  }

  async getDriverStats(driverId: string): Promise<DriverStats> {
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

    const match = { assignedDriverId: new mongoose.Types.ObjectId(driverId) };

    const [total, active, deliveredToday, completed, codTotals] =
      await Promise.all([
        ShipmentModel.countDocuments(match),
        ShipmentModel.countDocuments({
          ...match,
          status: { $in: ["pending", "in-transit"] },
        }),
        ShipmentModel.countDocuments({
          ...match,
          status: "delivered",
          deliveredAt: { $gte: startOfToday, $lt: startOfTomorrow },
        }),
        ShipmentModel.countDocuments({ ...match, status: "delivered" }),
        ShipmentModel.aggregate<{ total: number }>([
          {
            $match: {
              ...match,
              paymentMethod: "cod",
              paymentStatus: "pending",
              status: { $in: ["pending", "in-transit"] },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    return {
      total,
      active,
      deliveredToday,
      completed,
      codToCollect: codTotals[0]?.total ?? 0,
    };
  }

  async getAnalytics(): Promise<ShipmentAnalytics> {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const now = new Date();
    const last30Start = new Date(now.getTime() - 30 * DAY_MS);
    const prev30Start = new Date(now.getTime() - 60 * DAY_MS);

    const deliveredIn = (
      start: Date,
      end?: Date,
    ): Record<string, any> => {
      const range = (extra: Date | undefined) =>
        extra ? { $gte: start, $lt: extra } : { $gte: start };
      return {
        status: "delivered",
        $or: [
          { deliveredAt: range(end) },
          { deliveredAt: null, updatedAt: range(end) },
        ],
      };
    };
    const cancelledIn = (
      start: Date,
      end?: Date,
    ): Record<string, any> => ({
      status: "cancelled",
      updatedAt: end ? { $gte: start, $lt: end } : { $gte: start },
    });
    const sumAmount = { $group: { _id: null, total: { $sum: "$amount" } } };
    const avgDuration = {
      $group: {
        _id: null,
        avg: { $avg: { $subtract: ["$deliveredAt", "$createdAt"] } },
      },
    };

    const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
    const nowInNepal = new Date(now.getTime() + nepalOffsetMs);
    const firstMonthNepal = new Date(
      Date.UTC(nowInNepal.getUTCFullYear(), nowInNepal.getUTCMonth() - 5, 1),
    );
    const sixMonthsStart = new Date(firstMonthNepal.getTime() - nepalOffsetMs);

    const [
      totalRevAgg,
      revLast30Agg,
      revPrev30Agg,
      deliveredTotal,
      deliveredLast30,
      deliveredPrev30,
      cancelledTotal,
      cancelledLast30,
      cancelledPrev30,
      avgTotalAgg,
      avgLast30Agg,
      avgPrev30Agg,
      monthlyAgg,
      regionAgg,
      totalShipments,
    ] = await Promise.all([
      ShipmentModel.aggregate<{ total: number }>([
        { $match: { paymentStatus: "paid" } },
        sumAmount,
      ]),
      ShipmentModel.aggregate<{ total: number }>([
        { $match: { paymentStatus: "paid", createdAt: { $gte: last30Start } } },
        sumAmount,
      ]),
      ShipmentModel.aggregate<{ total: number }>([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: prev30Start, $lt: last30Start },
          },
        },
        sumAmount,
      ]),
      ShipmentModel.countDocuments({ status: "delivered" }),
      ShipmentModel.countDocuments(deliveredIn(last30Start)),
      ShipmentModel.countDocuments(deliveredIn(prev30Start, last30Start)),
      ShipmentModel.countDocuments({ status: "cancelled" }),
      ShipmentModel.countDocuments(cancelledIn(last30Start)),
      ShipmentModel.countDocuments(cancelledIn(prev30Start, last30Start)),
      ShipmentModel.aggregate<{ avg: number }>([
        { $match: { status: "delivered", deliveredAt: { $ne: null } } },
        avgDuration,
      ]),
      ShipmentModel.aggregate<{ avg: number }>([
        { $match: { status: "delivered", deliveredAt: { $gte: last30Start } } },
        avgDuration,
      ]),
      ShipmentModel.aggregate<{ avg: number }>([
        {
          $match: {
            status: "delivered",
            deliveredAt: { $gte: prev30Start, $lt: last30Start },
          },
        },
        avgDuration,
      ]),
      ShipmentModel.aggregate<{ _id: string; revenue: number }>([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: sixMonthsStart },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
                timezone: "+05:45",
              },
            },
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      ShipmentModel.aggregate<{ _id: string; count: number }>([
        {
          $group: {
            _id: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$delivery.district", null] },
                    { $eq: ["$delivery.district", ""] },
                  ],
                },
                "Unknown",
                "$delivery.district",
              ],
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      ShipmentModel.countDocuments({}),
    ]);

    const pctChange = (current: number, prev: number): number => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
    };
    const round1 = (n: number): number => Math.round(n * 10) / 10;

    const totalRevenue = totalRevAgg[0]?.total ?? 0;
    const revenueDelta = round1(
      pctChange(revLast30Agg[0]?.total ?? 0, revPrev30Agg[0]?.total ?? 0),
    );
    const deliveriesDelta = round1(pctChange(deliveredLast30, deliveredPrev30));

    const avgDeliveryMs = avgTotalAgg[0]?.avg ?? null;
    const avgLast = avgLast30Agg[0]?.avg ?? null;
    const avgPrev = avgPrev30Agg[0]?.avg ?? null;
    const avgTimeDelta =
      avgLast !== null && avgPrev !== null && avgPrev > 0
        ? round1(((avgLast - avgPrev) / avgPrev) * 100)
        : 0;

    const resolvedTotal = deliveredTotal + cancelledTotal;
    const successRate =
      resolvedTotal > 0 ? (deliveredTotal / resolvedTotal) * 100 : 0;
    const resolvedLast = deliveredLast30 + cancelledLast30;
    const resolvedPrev = deliveredPrev30 + cancelledPrev30;
    const rateLast =
      resolvedLast > 0 ? (deliveredLast30 / resolvedLast) * 100 : null;
    const ratePrev =
      resolvedPrev > 0 ? (deliveredPrev30 / resolvedPrev) * 100 : null;
    const successDelta =
      rateLast !== null && ratePrev !== null ? round1(rateLast - ratePrev) : 0;

    const MONTH_LABELS = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const revenueByMonth = new Map(monthlyAgg.map((m) => [m._id, m.revenue]));
    const monthlyRevenue: MonthlyRevenue[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(
        Date.UTC(nowInNepal.getUTCFullYear(), nowInNepal.getUTCMonth() - i, 1),
      );
      const key = `${d.getUTCFullYear()}-${String(
        d.getUTCMonth() + 1,
      ).padStart(2, "0")}`;
      monthlyRevenue.push({
        label: MONTH_LABELS[d.getUTCMonth()],
        revenue: revenueByMonth.get(key) ?? 0,
      });
    }

    const regionVolume: RegionVolume[] = regionAgg.map((r) => ({
      region: r._id,
      count: r.count,
    }));

    return {
      totalRevenue,
      revenueDelta,
      deliveries: deliveredTotal,
      deliveriesDelta,
      avgDeliveryMs,
      avgTimeDelta,
      successRate: Math.round(successRate * 10) / 10,
      successDelta,
      monthlyRevenue,
      regionVolume,
      totalShipments,
    };
  }
}
