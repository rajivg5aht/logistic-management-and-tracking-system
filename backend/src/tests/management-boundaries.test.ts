import assert from "node:assert/strict";
import test from "node:test";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { AdminCreateDriverDTO } from "../dtos/driver.dto";
import {
  AdminAssignVehicleDTO,
  AdminCreateVehicleDTO,
} from "../dtos/vehicle.dto";

test("generic user creation only accepts customer accounts", () => {
  const base = {
    fullName: "Test User",
    email: "test@example.com",
    password: "secret1",
  };

  assert.equal(
    AdminCreateUserDTO.safeParse({ ...base, role: "customer" }).success,
    true,
  );
  assert.equal(
    AdminCreateUserDTO.safeParse({ ...base, role: "driver" }).success,
    false,
  );
});

test("generic user updates do not expose role conversion", () => {
  assert.equal(
    AdminUpdateUserDTO.safeParse({
      fullName: "Updated Name",
      role: "driver",
    }).success,
    false,
  );
});

test("driver onboarding requires operational identity fields", () => {
  const base = {
    fullName: "Test Driver",
    email: "driver@example.com",
    password: "secret1",
    phoneNumber: "9800000000",
  };

  assert.equal(AdminCreateDriverDTO.safeParse(base).success, false);
  assert.equal(
    AdminCreateDriverDTO.safeParse({
      ...base,
      licenseNumber: "LIC-001",
    }).success,
    true,
  );
});

test("fleet validates vehicle creation and nullable assignments", () => {
  assert.equal(
    AdminCreateVehicleDTO.safeParse({
      registrationNumber: "BA 12 PA 3456",
      type: "van",
    }).success,
    true,
  );
  assert.equal(
    AdminCreateVehicleDTO.safeParse({
      registrationNumber: "",
      type: "van",
    }).success,
    false,
  );
  assert.equal(AdminAssignVehicleDTO.safeParse({ driverId: null }).success, true);
});
