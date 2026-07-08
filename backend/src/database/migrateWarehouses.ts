import { connectToMongoDB, disconnectFromMongoDB } from "./mongodb";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";
import { WarehouseModel } from "../models/warehouse.model";

// Builds a short, unique warehouse code from a branch label, e.g.
// "Kathmandu Central" -> "KAT-01". Falls back to "WH" when the label has no
// usable letters.
function buildCode(label: string, taken: Set<string>): string {
  const letters = label.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const base = (letters.slice(0, 3) || "WH").padEnd(2, "H");
  let n = 1;
  let code = `${base}-${String(n).padStart(2, "0")}`;
  while (taken.has(code)) {
    n += 1;
    code = `${base}-${String(n).padStart(2, "0")}`;
  }
  taken.add(code);
  return code;
}

async function migrateWarehouses() {
  await connectToMongoDB();

  const drivers = await UserModel.find({ role: "driver" });
  const vehicles = await VehicleModel.find({});

  // Collect every distinct, non-empty legacy branch label.
  const labels = new Set<string>();
  for (const driver of drivers) {
    if (driver.branch?.trim()) labels.add(driver.branch.trim());
  }
  for (const vehicle of vehicles) {
    if (vehicle.branch?.trim()) labels.add(vehicle.branch.trim());
  }

  // Reuse existing warehouses (match by name) and only create the missing ones.
  const existing = await WarehouseModel.find({});
  const takenCodes = new Set(existing.map((w) => w.code));
  const warehouseByLabel = new Map<string, string>(); // label -> warehouseId
  for (const w of existing) warehouseByLabel.set(w.name, w._id.toString());

  let warehousesCreated = 0;
  for (const label of labels) {
    if (warehouseByLabel.has(label)) continue;
    const warehouse = await WarehouseModel.create({
      name: label,
      code: buildCode(label, takenCodes),
      status: "active",
    });
    warehouseByLabel.set(label, warehouse._id.toString());
    warehousesCreated += 1;
  }

  // Link each driver/vehicle that still has a branch but no warehouseId.
  let driversLinked = 0;
  for (const driver of drivers) {
    const label = driver.branch?.trim();
    if (!label || driver.warehouseId) continue;
    const id = warehouseByLabel.get(label);
    if (!id) continue;
    driver.warehouseId = id as any;
    await driver.save();
    driversLinked += 1;
  }

  let vehiclesLinked = 0;
  for (const vehicle of vehicles) {
    const label = vehicle.branch?.trim();
    if (!label || vehicle.warehouseId) continue;
    const id = warehouseByLabel.get(label);
    if (!id) continue;
    vehicle.warehouseId = id as any;
    await vehicle.save();
    vehiclesLinked += 1;
  }

  console.log(
    JSON.stringify(
      {
        distinctBranches: labels.size,
        warehousesCreated,
        driversLinked,
        vehiclesLinked,
      },
      null,
      2,
    ),
  );
}

migrateWarehouses()
  .catch((error) => {
    console.error("Warehouse migration failed", error);
    process.exitCode = 1;
  })
  .finally(disconnectFromMongoDB);
