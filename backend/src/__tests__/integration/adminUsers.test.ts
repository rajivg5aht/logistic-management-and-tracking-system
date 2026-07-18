import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedAdmin,
  seedCustomer,
  uniqueEmail,
} from "../helpers/factories";

describe("Integration: Admin User Routes", () => {
  let adminToken: string;

  beforeAll(async () => {
    await clearDatabase();
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/admin/users");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-admin user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/admin/users")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/users", () => {
    test("should return a paginated list of users", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return user statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users/stats")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("total");
    });
  });

  describe("POST /api/v1/admin/users", () => {
    test("should create a new customer", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set(authHeader(adminToken))
        .send({
          fullName: "Created Customer",
          email: uniqueEmail("admincreate"),
          password: "secret123",
          phoneNumber: "9800000000",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("customer");
    });

    test("should reject creating a driver from user management", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set(authHeader(adminToken))
        .send({
          fullName: "Should Fail",
          email: uniqueEmail("admincreate"),
          password: "secret123",
          role: "driver",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject a duplicate email", async () => {
      const email = uniqueEmail("admindup");
      const payload = {
        fullName: "Duplicate",
        email,
        password: "secret123",
        phoneNumber: "9800000000",
      };

      await request(app)
        .post("/api/v1/admin/users")
        .set(authHeader(adminToken))
        .send(payload);
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set(authHeader(adminToken))
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET / PUT / DELETE /api/v1/admin/users/:id", () => {
    test("should return a single user by id", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get(`/api/v1/admin/users/${customer.user._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(customer.user.email);
    });

    test("should update a user's details", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .put(`/api/v1/admin/users/${customer.user._id}`)
        .set(authHeader(adminToken))
        .send({ fullName: "Updated Name" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.fullName).toBe("Updated Name");
    });

    test("should delete a user without shipment history", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .delete(`/api/v1/admin/users/${customer.user._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
