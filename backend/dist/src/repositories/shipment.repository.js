"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const shipment_model_1 = require("../models/shipment.model");
class ShipmentMongoRepository {
    async create(data) {
        return shipment_model_1.ShipmentModel.create(data);
    }
    async getById(id) {
        return shipment_model_1.ShipmentModel.findById(id);
    }
    async getAll() {
        return shipment_model_1.ShipmentModel.find().sort({ createdAt: -1 });
    }
    async update(id, data) {
        return shipment_model_1.ShipmentModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        const deleted = await shipment_model_1.ShipmentModel.findByIdAndDelete(id);
        return !!deleted;
    }
    async getByCustomer(customerId) {
        return shipment_model_1.ShipmentModel.find({ customer: customerId }).sort({ createdAt: -1 });
    }
    async getByDriver(driverId, scope) {
        const query = { assignedDriverId: driverId };
        if (scope === "active") {
            query.status = { $in: ["pending", "in-transit"] };
        }
        else if (scope === "history") {
            query.status = { $in: ["delivered", "cancelled"] };
        }
        return shipment_model_1.ShipmentModel.find(query).sort({ updatedAt: -1 });
    }
    async getPaginated(page, limit, search, status) {
        const query = {};
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
        const total = await shipment_model_1.ShipmentModel.countDocuments(query);
        const shipments = await shipment_model_1.ShipmentModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return { shipments, total };
    }
    async getStats() {
        // Nepal uses UTC+05:45 year-round. Convert today's Nepal boundaries to UTC
        // before querying MongoDB so "Delivered Today" is accurate for local users.
        const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
        const nowInNepal = new Date(Date.now() + nepalOffsetMs);
        const startOfToday = new Date(Date.UTC(nowInNepal.getUTCFullYear(), nowInNepal.getUTCMonth(), nowInNepal.getUTCDate()) - nepalOffsetMs);
        const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        // Beginning of the 7-day window (today plus the six preceding days).
        const startOfWindow = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
        const [total, pending, inTransit, delivered, cancelled, deliveredToday, pendingCodTotals, dailyCounts,] = await Promise.all([
            shipment_model_1.ShipmentModel.countDocuments({}),
            shipment_model_1.ShipmentModel.countDocuments({ status: "pending" }),
            shipment_model_1.ShipmentModel.countDocuments({ status: "in-transit" }),
            shipment_model_1.ShipmentModel.countDocuments({ status: "delivered" }),
            shipment_model_1.ShipmentModel.countDocuments({ status: "cancelled" }),
            shipment_model_1.ShipmentModel.countDocuments({
                status: "delivered",
                $or: [
                    { deliveredAt: { $gte: startOfToday, $lt: startOfTomorrow } },
                    {
                        deliveredAt: null,
                        updatedAt: { $gte: startOfToday, $lt: startOfTomorrow },
                    },
                ],
            }),
            shipment_model_1.ShipmentModel.aggregate([
                {
                    $match: {
                        paymentMethod: "cod",
                        paymentStatus: "pending",
                        status: { $ne: "cancelled" },
                    },
                },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            // Shipments created per Nepal-local day over the 7-day window.
            shipment_model_1.ShipmentModel.aggregate([
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
        // Fill every day in the window, defaulting to 0 where no shipments exist.
        const countsByDate = new Map(dailyCounts.map((d) => [d._id, d.count]));
        const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dailyVolume = [];
        for (let offset = 6; offset >= 0; offset--) {
            // nowInNepal's UTC fields represent Nepal local time, so shifting by whole
            // days and reading the UTC getters yields the correct Nepal calendar day.
            const dayInNepal = new Date(nowInNepal.getTime() - offset * 24 * 60 * 60 * 1000);
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
    async getDriverStats(driverId) {
        // Reuse the same Nepal-local "today" boundary logic as getStats().
        const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
        const nowInNepal = new Date(Date.now() + nepalOffsetMs);
        const startOfToday = new Date(Date.UTC(nowInNepal.getUTCFullYear(), nowInNepal.getUTCMonth(), nowInNepal.getUTCDate()) - nepalOffsetMs);
        const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        const match = { assignedDriverId: new mongoose_1.default.Types.ObjectId(driverId) };
        const [total, active, deliveredToday, completed, codTotals] = await Promise.all([
            shipment_model_1.ShipmentModel.countDocuments(match),
            shipment_model_1.ShipmentModel.countDocuments({
                ...match,
                status: { $in: ["pending", "in-transit"] },
            }),
            shipment_model_1.ShipmentModel.countDocuments({
                ...match,
                status: "delivered",
                deliveredAt: { $gte: startOfToday, $lt: startOfTomorrow },
            }),
            shipment_model_1.ShipmentModel.countDocuments({ ...match, status: "delivered" }),
            shipment_model_1.ShipmentModel.aggregate([
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
}
exports.ShipmentMongoRepository = ShipmentMongoRepository;
