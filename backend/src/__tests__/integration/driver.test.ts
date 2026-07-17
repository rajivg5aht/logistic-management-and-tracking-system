import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedCustomer,
  seedDriver,
  SeededUser,
} from "../helpers/factories";

describe("Integration: Driver Routes", () => {
  let driver: SeededUser;

  beforeAll(async () => {
    await clearDatabase();
    driver = await seedDriver();
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/driver/me");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-driver user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/driver/me")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("driver profile and fleet", () => {
    test("should return the driver profile", async () => {
      const res = await request(app)
        .get("/api/v1/driver/me")
        .set(authHeader(driver.token));

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(driver.user.email);
    });

    test("should return driver statistics", async () => {
      const res = await request(app)
        .get("/api/v1/driver/stats")
        .set(authHeader(driver.token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should return the driver's fleet", async () => {
      const res = await request(app)
        .get("/api/v1/driver/fleet")
        .set(authHeader(driver.token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should return the driver's assignments", async () => {
      const res = await request(app)
        .get("/api/v1/driver/shipments")
        .set(authHeader(driver.token));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("availability", () => {
    test("should switch availability to off-duty", async () => {
      const freshDriver = await seedDriver();

      const res = await request(app)
        .patch("/api/v1/driver/availability")
        .set(authHeader(freshDriver.token))
        .send({ availabilityStatus: "off-duty" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.availabilityStatus).toBe("off-duty");
    });

    test("should reject a system-controlled availability status", async () => {
      const res = await request(app)
        .patch("/api/v1/driver/availability")
        .set(authHeader(driver.token))
        .send({ availabilityStatus: "on-delivery" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("fleet incidents and assignments", () => {
    test("should reject reporting an incident with no vehicle assigned", async () => {
      const res = await request(app)
        .post("/api/v1/driver/fleet/incidents")
        .set(authHeader(driver.token))
        .send({
          category: "mechanical",
          severity: "medium",
          description: "The brakes are making a loud grinding noise",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 for an assignment that is not the driver's", async () => {
      const unknownId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/v1/driver/shipments/${unknownId}`)
        .set(authHeader(driver.token));

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
