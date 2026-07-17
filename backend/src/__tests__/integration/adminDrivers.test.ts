import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedAdmin,
  seedCustomer,
  seedDriver,
  uniqueEmail,
} from "../helpers/factories";

const driverPayload = (overrides: Record<string, unknown> = {}) => ({
  fullName: "New Driver",
  email: uniqueEmail("driver"),
  password: "secret123",
  phoneNumber: "9800000000",
  licenseNumber: `LIC-${Date.now()}${Math.floor(Math.random() * 1000)}`,
  ...overrides,
});

describe("Integration: Admin Driver Routes", () => {
  let adminToken: string;

  beforeAll(async () => {
    await clearDatabase();
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/admin/drivers");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-admin user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/admin/drivers")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/admin/drivers", () => {
    test("should create a new driver", async () => {
      const res = await request(app)
        .post("/api/v1/admin/drivers")
        .set(authHeader(adminToken))
        .send(driverPayload());

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("driver");
    });

    test("should reject a driver without a license number", async () => {
      const res = await request(app)
        .post("/api/v1/admin/drivers")
        .set(authHeader(adminToken))
        .send(driverPayload({ licenseNumber: undefined }));

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject a duplicate email", async () => {
      const payload = driverPayload();

      await request(app)
        .post("/api/v1/admin/drivers")
        .set(authHeader(adminToken))
        .send(payload);
      const res = await request(app)
        .post("/api/v1/admin/drivers")
        .set(authHeader(adminToken))
        .send(driverPayload({ email: payload.email }));

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject a duplicate license number", async () => {
      const payload = driverPayload();

      await request(app)
        .post("/api/v1/admin/drivers")
        .set(authHeader(adminToken))
        .send(payload);
      const res = await request(app)
        .post("/api/v1/admin/drivers")
        .set(authHeader(adminToken))
        .send(driverPayload({ licenseNumber: payload.licenseNumber }));

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/drivers", () => {
    test("should return a paginated list of drivers", async () => {
      const res = await request(app)
        .get("/api/v1/admin/drivers")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return driver statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/drivers/stats")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("total");
    });

    test("should return a single driver by id", async () => {
      const driver = await seedDriver();

      const res = await request(app)
        .get(`/api/v1/admin/drivers/${driver.user._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(driver.user.email);
    });
  });

  describe("PUT / DELETE /api/v1/admin/drivers/:id", () => {
    test("should update a driver's details", async () => {
      const driver = await seedDriver();

      const res = await request(app)
        .put(`/api/v1/admin/drivers/${driver.user._id}`)
        .set(authHeader(adminToken))
        .send({ fullName: "Updated Driver" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.fullName).toBe("Updated Driver");
    });

    test("should delete a driver without shipments or a vehicle", async () => {
      const driver = await seedDriver();

      const res = await request(app)
        .delete(`/api/v1/admin/drivers/${driver.user._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
