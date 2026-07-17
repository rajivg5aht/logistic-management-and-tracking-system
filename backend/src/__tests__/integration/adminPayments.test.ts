import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedAdmin,
  seedCustomer,
  seedShipment,
} from "../helpers/factories";

describe("Integration: Admin Payment Routes", () => {
  let adminToken: string;

  beforeAll(async () => {
    await clearDatabase();
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/admin/payments");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-admin user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/admin/payments")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("listing", () => {
    test("should return a paginated list of payments", async () => {
      const res = await request(app)
        .get("/api/v1/admin/payments")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return payment statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/payments/stats")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("revenue");
    });
  });

  describe("POST /api/v1/admin/payments/refund", () => {
    test("should record a refund for a shipment", async () => {
      const customer = await seedCustomer();
      const shipment = await seedShipment({
        customer: customer.user._id,
        amount: 500,
      });

      const res = await request(app)
        .post("/api/v1/admin/payments/refund")
        .set(authHeader(adminToken))
        .send({ shipmentId: String(shipment._id), amount: 100 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.type).toBe("refund");
    });

    test("should reject a refund without a shipment id", async () => {
      const res = await request(app)
        .post("/api/v1/admin/payments/refund")
        .set(authHeader(adminToken))
        .send({ amount: 100 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/admin/payments/:id/settle", () => {
    test("should return 404 for an unknown payment", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/v1/admin/payments/${id}/settle`)
        .set(authHeader(adminToken))
        .send({});

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
