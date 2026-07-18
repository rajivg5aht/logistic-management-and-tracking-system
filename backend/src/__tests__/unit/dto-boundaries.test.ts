import { ChangePasswordDTO } from "../../dtos/user.dto";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../../dtos/admin.dto";
import { AdminCreateDriverDTO } from "../../dtos/driver.dto";
import {
  AdminAssignVehicleDTO,
  AdminCreateVehicleDTO,
} from "../../dtos/vehicle.dto";
import {
  DRIVER_STAGE_TO_SHIPMENT_STATUS,
  SHIPMENT_STATUS_TO_DRIVER_STAGE,
  CUSTOMER_HISTORY_STATUSES,
} from "../../types/shipment.type";
import { AdminUpdateShipmentDTO } from "../../dtos/shipment.dto";
import { AdminIncidentUpdateDTO } from "../../dtos/fleetReport.dto";
import { VEHICLE_INCIDENT_STATUSES } from "../../models/vehicleIncident.model";
import { VEHICLE_STATUSES } from "../../models/vehicle.model";

describe("Unit: DTO and workflow boundaries", () => {
  test("generic user creation accepts only customer accounts", () => {
    const base = {
      fullName: "Test User",
      email: "test@example.com",
      password: "secret1",
    };

    expect(AdminCreateUserDTO.safeParse({ ...base, role: "customer" }).success).toBe(
      true,
    );
    expect(AdminCreateUserDTO.safeParse({ ...base, role: "driver" }).success).toBe(
      false,
    );
  });

  test("password changes require the current password and a strong replacement", () => {
    expect(
      ChangePasswordDTO.safeParse({
        currentPassword: "",
        newPassword: "new-secret",
      }).success,
    ).toBe(false);
    expect(
      ChangePasswordDTO.safeParse({
        currentPassword: "current-secret",
        newPassword: "short",
      }).success,
    ).toBe(false);
    expect(
      ChangePasswordDTO.safeParse({
        currentPassword: "current-secret",
        newPassword: "new-secret",
      }).success,
    ).toBe(true);
  });

  test("generic user updates do not expose role conversion", () => {
    expect(
      AdminUpdateUserDTO.safeParse({
        fullName: "Updated Name",
        role: "driver",
      }).success,
    ).toBe(false);
  });

  test("driver onboarding requires operational identity fields", () => {
    const base = {
      fullName: "Test Driver",
      email: "driver@example.com",
      password: "secret1",
      phoneNumber: "9800000000",
    };

    expect(AdminCreateDriverDTO.safeParse(base).success).toBe(false);
    expect(
      AdminCreateDriverDTO.safeParse({ ...base, licenseNumber: "LIC-001" }).success,
    ).toBe(true);
  });

  test("fleet validates vehicle creation and nullable assignments", () => {
    expect(
      AdminCreateVehicleDTO.safeParse({
        registrationNumber: "BA 12 PA 3456",
        type: "van",
      }).success,
    ).toBe(true);
    expect(
      AdminCreateVehicleDTO.safeParse({
        registrationNumber: "",
        type: "van",
      }).success,
    ).toBe(false);
    expect(AdminAssignVehicleDTO.safeParse({ driverId: null }).success).toBe(true);
  });

  test("driver milestones map to the status shown to admin and customer", () => {
    expect(DRIVER_STAGE_TO_SHIPMENT_STATUS).toEqual({
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
    expect(SHIPMENT_STATUS_TO_DRIVER_STAGE).toEqual({
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
      expect(AdminUpdateShipmentDTO.safeParse({ driverStage }).success).toBe(true);
    }

    expect(AdminUpdateShipmentDTO.safeParse({ driverStage: "assigned" }).success).toBe(
      false,
    );
    expect(AdminUpdateShipmentDTO.safeParse({ driverStage: "cancelled" }).success).toBe(
      false,
    );
  });

  test("customer history deletion is limited to terminal shipments", () => {
    expect(CUSTOMER_HISTORY_STATUSES).toEqual(["delivered", "cancelled"]);
  });

  test("fleet issue workflow exposes only the two admin decisions", () => {
    expect(VEHICLE_INCIDENT_STATUSES).toEqual([
      "pending_review",
      "resolved",
      "maintenance_required",
    ]);
    expect(AdminIncidentUpdateDTO.safeParse({ decision: "normal" }).success).toBe(true);
    expect(
      AdminIncidentUpdateDTO.safeParse({ decision: "maintenance_required" }).success,
    ).toBe(true);
    expect(AdminIncidentUpdateDTO.safeParse({ status: "in_repair" }).success).toBe(
      false,
    );
  });

  test("fleet status choices are limited to the simplified lifecycle", () => {
    expect(VEHICLE_STATUSES).toEqual([
      "available",
      "active",
      "maintenance_required",
      "inactive",
    ]);
  });
});
