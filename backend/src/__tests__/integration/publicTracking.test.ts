import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedCustomer,
  validShipmentPayload,
  SeededUser,
} from "../helpers/factories";

describe("Integration: Public Track-by-Code Route", () => {
  let customer: SeededUser;
  let trackingId: string;

  beforeAll(async () => {
    await clearDatabase();
    customer = await seedCustomer();

    // Book a shipment through the API so it gets a real LN-###### tracking ID.
    const created = await request(app)
      .post("/api/v1/shipments")
      .set(authHeader(customer.token))
      .send(validShipmentPayload());
    trackingId = created.body.data.trackingId;
  });

  test("returns a shipment by tracking ID without any auth token", async () => {
    const res = await request(app).get(`/api/v1/track/${trackingId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.trackingId).toBe(trackingId);
  });

  test("normalizes lowercase input to match the stored tracking ID", async () => {
    const res = await request(app).get(
      `/api/v1/track/${trackingId.toLowerCase()}`,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data.trackingId).toBe(trackingId);
  });

  test("returns 404 for an unknown tracking ID", async () => {
    const res = await request(app).get("/api/v1/track/LN-000000");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
