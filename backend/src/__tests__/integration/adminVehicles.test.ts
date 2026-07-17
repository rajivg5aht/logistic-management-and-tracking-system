import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedAdmin,
  seedCustomer,
  seedDriver,
  seedVehicle,
} from "../helpers/factories";

const registration = () =>
  `BA${Date.now()}${Math.floor(Math.random() * 1000)}`;

describe("Integration: Admin Vehicle Routes", () => {
  let adminToken: string;

  beforeAll(async () => {
    await clearDatabase();
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/admin/vehicles");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-admin user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/admin/vehicles")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/admin/vehicles", () => {
    test("should create a new vehicle", async () => {
      const res = await request(app)
        .post("/api/v1/admin/vehicles")
        .set(authHeader(adminToken))
        .send({ registrationNumber: registration(), type: "van" });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("available");
    });

    test("should reject a vehicle without a registration number", async () => {
      const res = await request(app)
        .post("/api/v1/admin/vehicles")
        .set(authHeader(adminToken))
        .send({ registrationNumber: "", type: "van" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/vehicles", () => {
    test("should return a paginated list of vehicles", async () => {
      const res = await request(app)
        .get("/api/v1/admin/vehicles")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return fleet statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/vehicles/stats")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("total");
    });

    test("should return a single vehicle by id", async () => {
      const vehicle = await seedVehicle();

      const res = await request(app)
        .get(`/api/v1/admin/vehicles/${vehicle._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data.registrationNumber).toBe(vehicle.registrationNumber);
    });
  });

  describe("PUT / PATCH / DELETE /api/v1/admin/vehicles/:id", () => {
    test("should update a vehicle", async () => {
      const vehicle = await seedVehicle();

      const res = await request(app)
        .put(`/api/v1/admin/vehicles/${vehicle._id}`)
        .set(authHeader(adminToken))
        .send({ make: "Nissan" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.make).toBe("Nissan");
    });

    test("should assign and then unassign a driver", async () => {
      const driver = await seedDriver();
      const vehicle = await seedVehicle();

      const assignRes = await request(app)
        .patch(`/api/v1/admin/vehicles/${vehicle._id}/assignment`)
        .set(authHeader(adminToken))
        .send({ driverId: String(driver.user._id) });

      expect(assignRes.statusCode).toBe(200);
      expect(assignRes.body.data.assignedDriverId).toBe(String(driver.user._id));
      expect(assignRes.body.data.status).toBe("active");

      const unassignRes = await request(app)
        .patch(`/api/v1/admin/vehicles/${vehicle._id}/assignment`)
        .set(authHeader(adminToken))
        .send({ driverId: null });

      expect(unassignRes.statusCode).toBe(200);
      expect(unassignRes.body.data.assignedDriverId).toBeNull();
    });

    test("should deactivate a vehicle without a driver", async () => {
      const vehicle = await seedVehicle();

      const res = await request(app)
        .delete(`/api/v1/admin/vehicles/${vehicle._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
