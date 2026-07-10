import { connectToMongoDB, disconnectFromMongoDB } from "./mongodb";
import { ShipmentModel } from "../models/shipment.model";
import { PaymentModel } from "../models/payment.model";

function generateReference(method: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `TXN-${method.toUpperCase()}-${Date.now().toString(36)}${rand}`.toUpperCase();
}

// Backfills one `charge` payment per existing shipment so the payments ledger
// reflects history. Idempotent: shipments that already have a charge are skipped.
async function migratePayments() {
  await connectToMongoDB();

  const shipments = await ShipmentModel.find();
  let created = 0;
  let skipped = 0;

  for (const shipment of shipments) {
    const existing = await PaymentModel.findOne({
      shipmentId: shipment._id,
      type: "charge",
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const isPrepaid = shipment.paymentMethod !== "cod";
    // Prepaid is captured up front; a "paid" COD historically means the driver
    // collected the cash, so seed it as "collected" (admin can then settle it).
    const status = isPrepaid
      ? "paid"
      : shipment.paymentStatus === "paid"
        ? "collected"
        : "pending";

    await PaymentModel.create({
      shipmentId: shipment._id,
      customerId: shipment.customer,
      type: "charge",
      method: shipment.paymentMethod,
      amount: shipment.amount,
      status,
      reference: isPrepaid ? generateReference(shipment.paymentMethod) : "",
      collectedAt: status === "collected" ? shipment.updatedAt : null,
    });
    created += 1;
  }

  console.log(
    JSON.stringify(
      { shipmentsScanned: shipments.length, created, skipped },
      null,
      2,
    ),
  );
}

migratePayments()
  .catch((error) => {
    console.error("Payments migration failed", error);
    process.exitCode = 1;
  })
  .finally(disconnectFromMongoDB);
