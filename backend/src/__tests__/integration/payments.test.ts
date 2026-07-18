import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedCustomer,
  seedShipment,
  SeededUser,
} from "../helpers/factories";

describe("Integration: Payment Routes", () => {
  let customer: SeededUser;

  beforeAll(async () => {
    await clearDatabase();
    customer = await seedCustomer();
  });

  test("should reject requests without a token", async () => {
    const res = await request(app).get("/api/v1/payments/mine");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return the customer's own payments", async () => {
    const res = await request(app)
      .get("/api/v1/payments/mine")
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should return payments for a shipment", async () => {
    const shipment = await seedShipment({ customer: customer.user._id });

    const res = await request(app)
      .get(`/api/v1/payments/shipment/${shipment._id}`)
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should reject an invalid shipment id", async () => {
    const res = await request(app)
      .get("/api/v1/payments/shipment/not-a-valid-id")
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
