import assert from "node:assert/strict";
import test from "node:test";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { AdminCreateDriverDTO } from "../dtos/driver.dto";
import {
  AdminAssignVehicleDTO,
  AdminCreateVehicleDTO,
} from "../dtos/vehicle.dto";
import {
  DRIVER_STAGE_TO_SHIPMENT_STATUS,
  SHIPMENT_STATUS_TO_DRIVER_STAGE,
  CUSTOMER_HISTORY_STATUSES,
} from "../types/shipment.type";
import { AdminUpdateShipmentDTO } from "../dtos/shipment.dto";

test("generic user creation accepts only customer accounts", () => {
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

test("driver milestones map to the status shown to admin and customer", () => {
  assert.deepEqual(DRIVER_STAGE_TO_SHIPMENT_STATUS, {
    assigned: "pending",
    "picked-up": "in-transit",
    "in-transit": "in-transit",
    "out-for-delivery": "in-transit",
    delivered: "delivered",
    failed: "in-transit",
    returned: "cancelled",
  });
});

test("admin statuses map back to a compatible driver milestone", () => {
  assert.deepEqual(SHIPMENT_STATUS_TO_DRIVER_STAGE, {
    pending: "assigned",
    "in-transit": "in-transit",
    delivered: "delivered",
    cancelled: "returned",
  });
});

test("admin shipment updates accept only operational delivery stages", () => {
  for (const driverStage of [
    "picked-up",
    "in-transit",
    "out-for-delivery",
    "delivered",
  ]) {
    assert.equal(
      AdminUpdateShipmentDTO.safeParse({ driverStage }).success,
      true,
    );
  }

  assert.equal(
    AdminUpdateShipmentDTO.safeParse({ driverStage: "assigned" }).success,
    false,
  );
  assert.equal(
    AdminUpdateShipmentDTO.safeParse({ driverStage: "cancelled" }).success,
    false,
  );
});

test("customer history deletion is limited to terminal shipments", () => {
  assert.deepEqual(CUSTOMER_HISTORY_STATUSES, ["delivered", "cancelled"]);
});
