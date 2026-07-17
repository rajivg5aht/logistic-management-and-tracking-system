import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { VehicleIncidentModel } from "../../models/vehicleIncident.model";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedAdmin,
  seedCustomer,
  seedDriver,
  seedVehicle,
} from "../helpers/factories";

describe("Integration: Admin Fleet Report Routes", () => {
  let adminToken: string;

  beforeAll(async () => {
    await clearDatabase();
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/admin/fleet-reports/incidents");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-admin user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/admin/fleet-reports/incidents")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("listing", () => {
    test("should return incidents", async () => {
      const res = await request(app)
        .get("/api/v1/admin/fleet-reports/incidents")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return fuel expenses", async () => {
      const res = await request(app)
        .get("/api/v1/admin/fleet-reports/fuel-expenses")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return fleet report statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/fleet-reports/stats")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /api/v1/admin/fleet-reports/incidents/:id", () => {
    test("should resolve a pending incident", async () => {
      const driver = await seedDriver();
      const vehicle = await seedVehicle();
      const incident = await VehicleIncidentModel.create({
        vehicleId: vehicle._id,
        driverId: driver.user._id,
        category: "mechanical",
        severity: "medium",
        description: "The brakes are grinding on every stop",
      });

      const res = await request(app)
        .patch(`/api/v1/admin/fleet-reports/incidents/${incident._id}`)
        .set(authHeader(adminToken))
        .send({ decision: "normal" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("resolved");
    });

    test("should reject an invalid decision", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/v1/admin/fleet-reports/incidents/${id}`)
        .set(authHeader(adminToken))
        .send({ decision: "unknown" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 for an unknown incident", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/v1/admin/fleet-reports/incidents/${id}`)
        .set(authHeader(adminToken))
        .send({ decision: "normal" });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
