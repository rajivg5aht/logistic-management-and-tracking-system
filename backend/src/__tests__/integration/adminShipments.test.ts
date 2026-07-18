import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedAdmin,
  seedCustomer,
  seedShipment,
} from "../helpers/factories";

describe("Integration: Admin Shipment Routes", () => {
  let adminToken: string;

  beforeAll(async () => {
    await clearDatabase();
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/admin/shipments");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-admin user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/admin/shipments")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/shipments", () => {
    test("should return a paginated list of shipments", async () => {
      const res = await request(app)
        .get("/api/v1/admin/shipments")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return shipment statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/shipments/stats")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should return shipment analytics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/shipments/analytics")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should return a single shipment by id", async () => {
      const customer = await seedCustomer();
      const shipment = await seedShipment({ customer: customer.user._id });

      const res = await request(app)
        .get(`/api/v1/admin/shipments/${shipment._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data.trackingId).toBe(shipment.trackingId);
    });
  });

  describe("PUT / DELETE /api/v1/admin/shipments/:id", () => {
    test("should update the payment status of a shipment", async () => {
      const customer = await seedCustomer();
      const shipment = await seedShipment({ customer: customer.user._id });

      const res = await request(app)
        .put(`/api/v1/admin/shipments/${shipment._id}`)
        .set(authHeader(adminToken))
        .send({ paymentStatus: "paid" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.paymentStatus).toBe("paid");
    });

    test("should reject an invalid driver stage", async () => {
      const customer = await seedCustomer();
      const shipment = await seedShipment({ customer: customer.user._id });

      const res = await request(app)
        .put(`/api/v1/admin/shipments/${shipment._id}`)
        .set(authHeader(adminToken))
        .send({ driverStage: "assigned" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should delete a shipment", async () => {
      const customer = await seedCustomer();
      const shipment = await seedShipment({ customer: customer.user._id });

      const res = await request(app)
        .delete(`/api/v1/admin/shipments/${shipment._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
