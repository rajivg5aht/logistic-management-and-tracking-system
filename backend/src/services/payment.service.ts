import mongoose from "mongoose";
import { HttpException } from "../exceptions/http-exception";
import { PaymentModel, type IPayment } from "../models/payment.model";
import { ShipmentModel, type IShipment } from "../models/shipment.model";
import { UserModel } from "../models/user.model";

export type SafePayment = {
  id: string;
  shipmentId: string;
  trackingId: string | null;
  customerId: string;
  customerName: string | null;
  type: string;
  method: string;
  amount: number;
  status: string;
  reference: string;
  collectedByDriverId: string | null;
  collectedAt: Date | null;
  settledByAdminId: string | null;
  settledAt: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentStats = {
  revenue: number;
  outstandingCod: number;
  codHeldByDrivers: number;
  refunds: number;
};

type ListParams = {
  status?: string;
  method?: string;
  type?: string;
  page: number;
  limit: number;
};

const RECEIVED_STATUSES = ["paid", "collected", "settled"] as const;

function generateReference(method: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `TXN-${method.toUpperCase()}-${Date.now().toString(36)}${rand}`.toUpperCase();
}

export class PaymentService {
  private sanitize(
    payment: IPayment,
    names?: Map<string, string>,
    trackingIds?: Map<string, string>,
  ): SafePayment {
    return {
      id: payment._id.toString(),
      shipmentId: payment.shipmentId.toString(),
      trackingId: trackingIds?.get(payment.shipmentId.toString()) ?? null,
      customerId: payment.customerId.toString(),
      customerName: names?.get(payment.customerId.toString()) ?? null,
      type: payment.type,
      method: payment.method,
      amount: payment.amount,
      status: payment.status,
      reference: payment.reference,
      collectedByDriverId: payment.collectedByDriverId?.toString() ?? null,
      collectedAt: payment.collectedAt,
      settledByAdminId: payment.settledByAdminId?.toString() ?? null,
      settledAt: payment.settledAt,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private async buildLookups(payments: IPayment[]) {
    const customerIds = payments.map((p) => p.customerId);
    const shipmentIds = payments.map((p) => p.shipmentId);
    const [customers, shipments] = await Promise.all([
      UserModel.find({ _id: { $in: customerIds } }).select("_id fullName"),
      ShipmentModel.find({ _id: { $in: shipmentIds } }).select("_id trackingId"),
    ]);
    return {
      names: new Map(customers.map((c) => [c._id.toString(), c.fullName])),
      trackingIds: new Map(
        shipments.map((s) => [s._id.toString(), s.trackingId]),
      ),
    };
  }

  async createChargeForShipment(shipment: IShipment): Promise<SafePayment> {
    const isPrepaid = shipment.paymentMethod !== "cod";
    const payment = await PaymentModel.create({
      shipmentId: shipment._id,
      customerId: shipment.customer,
      type: "charge",
      method: shipment.paymentMethod,
      amount: shipment.amount,
      status: isPrepaid ? "paid" : "pending",
      reference: isPrepaid ? generateReference(shipment.paymentMethod) : "",
    });
    return this.sanitize(payment);
  }

  async recordCodCollection(
    shipmentId: mongoose.Types.ObjectId | string,
    driverId: string,
    collected: boolean,
  ): Promise<void> {
    let payment = await PaymentModel.findOne({
      shipmentId,
      type: "charge",
      method: "cod",
    });

    if (!payment) {
      const shipment = await ShipmentModel.findById(shipmentId);
      if (!shipment) return;
      payment = await PaymentModel.create({
        shipmentId: shipment._id,
        customerId: shipment.customer,
        type: "charge",
        method: "cod",
        amount: shipment.amount,
        status: "pending",
      });
    }

    if (payment.status === "settled") return;

    if (collected) {
      payment.status = "collected";
      payment.collectedByDriverId = new mongoose.Types.ObjectId(driverId);
      payment.collectedAt = new Date();
    } else {
      payment.status = "pending";
      payment.collectedByDriverId = null;
      payment.collectedAt = null;
    }
    await payment.save();
  }

  async getMyPayments(customerId: string): Promise<SafePayment[]> {
    const payments = await PaymentModel.find({ customerId }).sort({
      createdAt: -1,
    });
    const { trackingIds } = await this.buildLookups(payments);
    return payments.map((p) => this.sanitize(p, undefined, trackingIds));
  }

  async getByShipment(shipmentId: string): Promise<SafePayment[]> {
    if (!mongoose.isValidObjectId(shipmentId)) {
      throw new HttpException(400, "Invalid shipment id");
    }
    const payments = await PaymentModel.find({ shipmentId }).sort({
      createdAt: -1,
    });
    const { names, trackingIds } = await this.buildLookups(payments);
    return payments.map((p) => this.sanitize(p, names, trackingIds));
  }

  async listPayments({
    status,
    method,
    type,
    page,
    limit,
  }: ListParams): Promise<{ items: SafePayment[]; total: number }> {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (method) query.method = method;
    if (type) query.type = type;

    const [payments, total] = await Promise.all([
      PaymentModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PaymentModel.countDocuments(query),
    ]);

    const { names, trackingIds } = await this.buildLookups(payments);
    return {
      items: payments.map((p) => this.sanitize(p, names, trackingIds)),
      total,
    };
  }

  async adminSettleCod(adminId: string, paymentId: string): Promise<SafePayment> {
    if (!mongoose.isValidObjectId(paymentId)) {
      throw new HttpException(404, "Payment not found");
    }
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new HttpException(404, "Payment not found");
    if (payment.method !== "cod" || payment.type !== "charge") {
      throw new HttpException(400, "Only COD charges can be settled");
    }
    if (payment.status !== "collected") {
      throw new HttpException(
        400,
        "Only collected COD payments can be settled",
      );
    }

    payment.status = "settled";
    payment.settledByAdminId = new mongoose.Types.ObjectId(adminId);
    payment.settledAt = new Date();
    await payment.save();

    const { names, trackingIds } = await this.buildLookups([payment]);
    return this.sanitize(payment, names, trackingIds);
  }

  async adminRefund(
    adminId: string,
    shipmentId: string,
    amount: number | undefined,
    reason: string,
  ): Promise<SafePayment> {
    if (!mongoose.isValidObjectId(shipmentId)) {
      throw new HttpException(404, "Shipment not found");
    }
    const shipment = await ShipmentModel.findById(shipmentId);
    if (!shipment) throw new HttpException(404, "Shipment not found");

    const refundAmount = amount ?? shipment.amount;
    if (refundAmount <= 0 || refundAmount > shipment.amount) {
      throw new HttpException(
        400,
        "Refund amount must be between 1 and the shipment amount",
      );
    }

    const payment = await PaymentModel.create({
      shipmentId: shipment._id,
      customerId: shipment.customer,
      type: "refund",
      method: shipment.paymentMethod,
      amount: refundAmount,
      status: "refunded",
      reference: generateReference("refund"),
      settledByAdminId: new mongoose.Types.ObjectId(adminId),
      settledAt: new Date(),
      notes: reason,
    });

    const { names, trackingIds } = await this.buildLookups([payment]);
    return this.sanitize(payment, names, trackingIds);
  }

  async getStats(): Promise<PaymentStats> {
    const sumBy = async (match: Record<string, unknown>): Promise<number> => {
      const [agg] = await PaymentModel.aggregate<{ total: number }>([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return agg?.total ?? 0;
    };

    const [revenue, outstandingCod, codHeldByDrivers, refunds] =
      await Promise.all([
        sumBy({ type: "charge", status: { $in: RECEIVED_STATUSES } }),
        sumBy({ type: "charge", method: "cod", status: "pending" }),
        sumBy({ type: "charge", method: "cod", status: "collected" }),
        sumBy({ type: "refund" }),
      ]);

    return { revenue, outstandingCod, codHeldByDrivers, refunds };
  }
}
