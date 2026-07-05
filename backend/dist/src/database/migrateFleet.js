"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("./mongodb");
const user_model_1 = require("../models/user.model");
const vehicle_model_1 = require("../models/vehicle.model");
async function migrateFleet() {
    await (0, mongodb_1.connectToMongoDB)();
    const drivers = await user_model_1.UserModel.find({ role: "driver" });
    let vehiclesCreated = 0;
    let assignmentsLinked = 0;
    const incompleteDrivers = [];
    for (const driver of drivers) {
        if (!driver.phoneNumber || !driver.licenseNumber) {
            incompleteDrivers.push(`${driver.fullName} <${driver.email}>`);
        }
        if (!driver.vehicleNumber ||
            !driver.vehicleType ||
            driver.assignedVehicleId) {
            continue;
        }
        const registrationNumber = driver.vehicleNumber.trim().toUpperCase();
        let vehicle = await vehicle_model_1.VehicleModel.findOne({ registrationNumber });
        if (!vehicle) {
            vehicle = await vehicle_model_1.VehicleModel.create({
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
    console.log(JSON.stringify({
        driversScanned: drivers.length,
        vehiclesCreated,
        assignmentsLinked,
        incompleteDrivers,
    }, null, 2));
}
migrateFleet()
    .catch((error) => {
    console.error("Fleet migration failed", error);
    process.exitCode = 1;
})
    .finally(mongodb_1.disconnectFromMongoDB);
