import assert from "node:assert/strict";
import test from "node:test";
import { ChangePasswordDTO } from "../dtos/user.dto";
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
import { AdminIncidentUpdateDTO } from "../dtos/fleetReport.dto";
import { VEHICLE_INCIDENT_STATUSES } from "../models/vehicleIncident.model";
import { VEHICLE_STATUSES } from "../models/vehicle.model";

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

test("password changes require the current password and a strong replacement", () => {
  assert.equal(
    ChangePasswordDTO.safeParse({
      currentPassword: "",
      newPassword: "new-secret",
    }).success,
    false,
  );
  assert.equal(
    ChangePasswordDTO.safeParse({
      currentPassword: "current-secret",
      newPassword: "short",
    }).success,
    false,
  );
  assert.equal(
    ChangePasswordDTO.safeParse({
      currentPassword: "current-secret",
      newPassword: "new-secret",
    }).success,
    true,
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
test("fleet issue workflow exposes only the two admin decisions", () => {
  assert.deepEqual(VEHICLE_INCIDENT_STATUSES, [
    "pending_review",
    "resolved",
    "maintenance_required",
  ]);
  assert.equal(
    AdminIncidentUpdateDTO.safeParse({ decision: "normal" }).success,
    true,
  );
  assert.equal(
    AdminIncidentUpdateDTO.safeParse({ decision: "maintenance_required" })
      .success,
    true,
  );
  assert.equal(
    AdminIncidentUpdateDTO.safeParse({ status: "in_repair" }).success,
    false,
  );
});

test("fleet status choices are limited to the simplified lifecycle", () => {
  assert.deepEqual(VEHICLE_STATUSES, [
    "available",
    "active",
    "maintenance_required",
    "inactive",
  ]);
});
