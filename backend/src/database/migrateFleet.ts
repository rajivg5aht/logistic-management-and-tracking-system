import { connectToMongoDB, disconnectFromMongoDB } from "./mongodb";
import { UserModel } from "../models/user.model";
import { VehicleModel } from "../models/vehicle.model";

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
      vehicle.status = "assigned";
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

  console.log(
    JSON.stringify(
      {
        driversScanned: drivers.length,
        vehiclesCreated,
        assignmentsLinked,
        incompleteDrivers,
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
