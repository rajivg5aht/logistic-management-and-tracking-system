"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const admin_dto_1 = require("../dtos/admin.dto");
const driver_dto_1 = require("../dtos/driver.dto");
const vehicle_dto_1 = require("../dtos/vehicle.dto");
(0, node_test_1.default)("generic user creation only accepts customer accounts", () => {
    const base = {
        fullName: "Test User",
        email: "test@example.com",
        password: "secret1",
    };
    strict_1.default.equal(admin_dto_1.AdminCreateUserDTO.safeParse({ ...base, role: "customer" }).success, true);
    strict_1.default.equal(admin_dto_1.AdminCreateUserDTO.safeParse({ ...base, role: "driver" }).success, false);
});
(0, node_test_1.default)("generic user updates do not expose role conversion", () => {
    strict_1.default.equal(admin_dto_1.AdminUpdateUserDTO.safeParse({
        fullName: "Updated Name",
        role: "driver",
    }).success, false);
});
(0, node_test_1.default)("driver onboarding requires operational identity fields", () => {
    const base = {
        fullName: "Test Driver",
        email: "driver@example.com",
        password: "secret1",
        phoneNumber: "9800000000",
    };
    strict_1.default.equal(driver_dto_1.AdminCreateDriverDTO.safeParse(base).success, false);
    strict_1.default.equal(driver_dto_1.AdminCreateDriverDTO.safeParse({
        ...base,
        licenseNumber: "LIC-001",
    }).success, true);
});
(0, node_test_1.default)("fleet validates vehicle creation and nullable assignments", () => {
    strict_1.default.equal(vehicle_dto_1.AdminCreateVehicleDTO.safeParse({
        registrationNumber: "BA 12 PA 3456",
        type: "van",
    }).success, true);
    strict_1.default.equal(vehicle_dto_1.AdminCreateVehicleDTO.safeParse({
        registrationNumber: "",
        type: "van",
    }).success, false);
    strict_1.default.equal(vehicle_dto_1.AdminAssignVehicleDTO.safeParse({ driverId: null }).success, true);
});
