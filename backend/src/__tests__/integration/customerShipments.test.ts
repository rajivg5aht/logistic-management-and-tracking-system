import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedCustomer,
  seedShipment,
  validShipmentPayload,
  SeededUser,
} from "../helpers/factories";

describe("Integration: Customer Shipment Routes", () => {
  let customer: SeededUser;

  beforeAll(async () => {
    await clearDatabase();
    customer = await seedCustomer();
  });

  test("should reject requests without a token", async () => {
    const res = await request(app).get("/api/v1/shipments/my");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  describe("POST /api/v1/shipments", () => {
    test("should create a shipment with a valid payload", async () => {
      const res = await request(app)
        .post("/api/v1/shipments")
        .set(authHeader(customer.token))
        .send(validShipmentPayload());

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trackingId).toBeDefined();
    });

    test("should reject an invalid shipment payload", async () => {
      const res = await request(app)
        .post("/api/v1/shipments")
        .set(authHeader(customer.token))
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  test("should return the customer's own shipments", async () => {
    const res = await request(app)
      .get("/api/v1/shipments/my")
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should return the latest location of an owned shipment", async () => {
    const shipment = await seedShipment({ customer: customer.user._id });

    const res = await request(app)
      .get(`/api/v1/shipments/${shipment._id}/location`)
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should update a pending shipment", async () => {
    const shipment = await seedShipment({ customer: customer.user._id });

    const res = await request(app)
      .patch(`/api/v1/shipments/${shipment._id}`)
      .set(authHeader(customer.token))
      .send({ amount: 750 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.amount).toBe(750);
  });

  test("should cancel a pending shipment", async () => {
    const shipment = await seedShipment({ customer: customer.user._id });

    const res = await request(app)
      .patch(`/api/v1/shipments/${shipment._id}/cancel`)
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("cancelled");
  });

  test("should delete a cancelled shipment from history", async () => {
    const shipment = await seedShipment({
      customer: customer.user._id,
      status: "cancelled",
    });

    const res = await request(app)
      .delete(`/api/v1/shipments/${shipment._id}`)
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should clear delivered and cancelled shipment history", async () => {
    await seedShipment({ customer: customer.user._id, status: "delivered" });
    await seedShipment({ customer: customer.user._id, status: "cancelled" });

    const res = await request(app)
      .delete("/api/v1/shipments/history")
      .set(authHeader(customer.token));

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.data.deletedCount).toBe("number");
  });
});
