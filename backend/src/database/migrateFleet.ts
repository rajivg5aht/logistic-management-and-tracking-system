import mongoose from "mongoose";
import { connectToMongoDB, disconnectFromMongoDB } from "./mongodb";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";
import { VehicleService } from "../services/vehicle.service";

const LEGACY_MAINTENANCE_COLLECTION = "maintenanceworkorders";
const ARCHIVED_MAINTENANCE_COLLECTION = "maintenanceworkorders_legacy";

function normalizedIncidentStatus(status: unknown) {
  if (
    [
      "maintenance_required",
      "assigned_to_maintenance",
      "in_repair",
      "awaiting_verification",
    ].includes(String(status))
  ) {
    return "maintenance_required" as const;
  }
  if (["closed", "resolved", "rejected"].includes(String(status))) {
    return "resolved" as const;
  }
  return "pending_review" as const;
}

function preservedAdminNote(incident: Record<string, unknown>): string {
  const notes = [
    typeof incident.adminNote === "string" ? incident.adminNote.trim() : "",
    typeof incident.resolutionNote === "string" && incident.resolutionNote.trim()
      ? `Resolution: ${incident.resolutionNote.trim()}`
      : "",
    typeof incident.rejectionReason === "string" && incident.rejectionReason.trim()
      ? `Previous rejection: ${incident.rejectionReason.trim()}`
      : "",
    typeof incident.maintenanceAction === "string" && incident.maintenanceAction.trim()
      ? `Maintenance note: ${incident.maintenanceAction.trim()}`
      : "",
  ].filter(Boolean);
  return [...new Set(notes)].join("\n");
}

async function archiveMaintenanceWorkOrders() {
  const db = mongoose.connection.db;
  if (!db) return 0;
  const collectionNames = new Set(
    (await db.listCollections().toArray()).map((collection) => collection.name),
  );
  if (!collectionNames.has(LEGACY_MAINTENANCE_COLLECTION)) return 0;

  const source = db.collection(LEGACY_MAINTENANCE_COLLECTION);
  const count = await source.countDocuments();
  if (collectionNames.has(ARCHIVED_MAINTENANCE_COLLECTION)) {
    const archive = db.collection(ARCHIVED_MAINTENANCE_COLLECTION);
    const documents = await source.find({}).toArray();
    if (documents.length > 0) {
      await archive.bulkWrite(
        documents.map((document) => ({
          replaceOne: {
            filter: { _id: document._id },
            replacement: document,
            upsert: true,
          },
        })),
      );
    }
    await source.drop();
  } else {
    await source.rename(ARCHIVED_MAINTENANCE_COLLECTION);
  }
  return count;
}

async function migrateFleet() {
  await connectToMongoDB();

  const drivers = await UserModel.find({ role: "driver" });
  let vehiclesCreated = 0;
  let assignmentsLinked = 0;
  const incompleteDrivers: string[] = [];

  for (const driver of drivers) {
    if (!driver.phoneNumber || !driver.licenseNumber) {
      incompleteDrivers.push(`${driver.fullName} <${driver.email}>`);
    }

    if (
      !driver.vehicleNumber ||
      !driver.vehicleType ||
      driver.assignedVehicleId
    ) {
      continue;
    }

    const registrationNumber = driver.vehicleNumber.trim().toUpperCase();
    let vehicle = await VehicleModel.findOne({ registrationNumber });
    if (!vehicle) {
      vehicle = await VehicleModel.create({
        registrationNumber,
        type: driver.vehicleType,
        branch: driver.branch || "",
        status: "available",
      });
      vehiclesCreated += 1;
    }

    if (!vehicle.assignedDriverId) {
      vehicle.assignedDriverId = driver._id;
      vehicle.status = "active";
      vehicle.assignmentHistory.push({
        driverId: driver._id,
        assignedAt: new Date(),
        unassignedAt: null,
      });
      await vehicle.save();
      driver.assignedVehicleId = vehicle._id;
      await driver.save();
      assignmentsLinked += 1;
    }
  }

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection is not ready");
  const vehicles = db.collection("vehicles");
  const incidents = db.collection("vehicleincidents");

  const assignedStatus = await vehicles.updateMany(
    { status: "assigned" },
    { $set: { status: "active" } },
  );
  const maintenanceStatus = await vehicles.updateMany(
    { status: "maintenance" },
    { $set: { status: "maintenance_required" } },
  );

  let incidentsNormalized = 0;
  const maintenanceVehicleIds = new Set<string>();
  for await (const incident of incidents.find({})) {
    const status = normalizedIncidentStatus(incident.status);
    if (status === "maintenance_required" && incident.vehicleId) {
      maintenanceVehicleIds.add(String(incident.vehicleId));
    }
    const reviewedAt =
      status === "pending_review"
        ? null
        : incident.reviewedAt ?? incident.updatedAt ?? new Date();
    const resolvedAt =
      status === "resolved"
        ? incident.resolvedAt ?? incident.updatedAt ?? new Date()
        : null;
    await incidents.updateOne(
      { _id: incident._id },
      {
        $set: {
          status,
          adminNote: preservedAdminNote(incident),
          reviewedAt,
          resolvedAt,
        },
        $unset: {
          resolutionNote: "",
          rejectionReason: "",
          maintenanceAction: "",
          rejectedAt: "",
        },
      },
    );
    incidentsNormalized += 1;
  }

  const maintenanceVehicles = await vehicles
    .find({ status: "maintenance_required" }, { projection: { _id: 1 } })
    .toArray();
  for (const vehicle of maintenanceVehicles) {
    maintenanceVehicleIds.add(String(vehicle._id));
  }

  const vehicleService = new VehicleService();
  let driversReleasedForMaintenance = 0;
  for (const vehicleId of maintenanceVehicleIds) {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || vehicle.status === "inactive") continue;
    if (vehicle.assignedDriverId) driversReleasedForMaintenance += 1;
    await vehicleService.markMaintenanceRequired(vehicleId);
  }

  await vehicles.updateMany(
    { status: "active", assignedDriverId: null },
    { $set: { status: "available" } },
  );
  await vehicles.updateMany(
    { status: "available", assignedDriverId: { $ne: null } },
    { $set: { status: "active" } },
  );

  const archivedWorkOrders = await archiveMaintenanceWorkOrders();

  console.log(
    JSON.stringify(
      {
        driversScanned: drivers.length,
        vehiclesCreated,
        assignmentsLinked,
        incompleteDrivers,
        legacyAssignedStatusesUpdated: assignedStatus.modifiedCount,
        legacyMaintenanceStatusesUpdated: maintenanceStatus.modifiedCount,
        incidentsNormalized,
        driversReleasedForMaintenance,
        archivedWorkOrders,
      },
      null,
      2,
    ),
  );
}

migrateFleet()
  .catch((error) => {
    console.error("Fleet migration failed", error);
    process.exitCode = 1;
  })
  .finally(disconnectFromMongoDB);
