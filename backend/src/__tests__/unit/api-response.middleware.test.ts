import express from "express";
import request from "supertest";
import { apiResponseMiddleware } from "../../middleware/api-response.middleware";
import { errorMiddleware, notFoundMiddleware } from "../../middleware/error.middleware";

const createApp = () => {
  const app = express();
  app.use(apiResponseMiddleware);
  app.get("/api/v1/shipments", (_req, res) => {
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Shipments retrieved successfully",
      data: [{ id: "shipment-1", trackingId: "LN-100001" }],
      meta: { page: 1, limit: 10, total: 12, totalPages: 2 },
    });
  });
  app.get("/api/v1/failure", () => {
    throw new Error("Unexpected failure");
  });
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
};

const createCollectionApp = () => {
  const app = express();
  app.use(apiResponseMiddleware);
  app.get(/\/api\/v1\/.*/, (_req, res) => {
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Collection retrieved successfully",
      data: [{ id: "resource-1" }],
    });
  });
  return app;
};

describe("Unit: API response middleware", () => {
  test("adds HATEOAS links, standard headers, and an ETag to a collection", async () => {
    const response = await request(createApp()).get("/api/v1/shipments?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBeTruthy();
    expect(response.headers.etag).toBeTruthy();
    expect(response.headers.link).toContain('rel="next"');
    expect(response.headers["cache-control"]).toBe("private, max-age=0, must-revalidate");
    expect(response.body.links).toEqual(
      expect.objectContaining({
        self: "/api/v1/shipments?page=1&limit=10",
        first: "/api/v1/shipments?page=1&limit=10",
        next: "/api/v1/shipments?page=2&limit=10",
        last: "/api/v1/shipments?page=2&limit=10",
      }),
    );
    expect(response.body.data[0]._links).toEqual({
      self: "/api/v1/shipments/shipment-1",
      collection: "/api/v1/shipments",
    });
  });

  test("honours If-None-Match for an unchanged GET response", async () => {
    const first = await request(createApp()).get("/api/v1/shipments");
    const cached = await request(createApp())
      .get("/api/v1/shipments")
      .set("If-None-Match", first.headers.etag);

    expect(cached.status).toBe(304);
    expect(cached.text).toBe("");
  });

  test.each([
    ["/api/v1/admin/fleet-reports/incidents", "/api/v1/admin/fleet-reports/incidents"],
    ["/api/v1/admin/fleet-reports/fuel-expenses", "/api/v1/admin/fleet-reports/fuel-expenses"],
    ["/api/v1/driver/fleet/fuel-expenses", "/api/v1/driver/fleet/fuel-expenses"],
    ["/api/v1/driver/fleet/incidents", "/api/v1/driver/fleet/incidents"],
    ["/api/v1/admin/announcements", "/api/v1/admin/announcements"],
    ["/api/v1/admin/shipments", "/api/v1/admin/shipments"],
    ["/api/v1/admin/vehicles", "/api/v1/admin/vehicles"],
    ["/api/v1/admin/drivers", "/api/v1/admin/drivers"],
    ["/api/v1/admin/users", "/api/v1/admin/users"],
    ["/api/v1/admin/payments", "/api/v1/admin/payments"],
    ["/api/v1/admin/inquiries", "/api/v1/admin/inquiries"],
    ["/api/v1/announcements", "/api/v1/announcements"],
    ["/api/v1/shipments", "/api/v1/shipments"],
    ["/api/v1/driver/shipments", "/api/v1/driver/shipments"],
    ["/api/v1/inquiries", "/api/v1/inquiries"],
    ["/api/v1/payments", "/api/v1/payments"],
    ["/api/v1/admin/shipments/resource-1?status=in-transit", "/api/v1/admin/shipments"],
    ["/api/v1/driver/shipments/resource-1/stage", "/api/v1/driver/shipments"],
    ["/api/v1/driver/fleet/incidents/resource-1", "/api/v1/driver/fleet/incidents"],
    ["/api/v1/admin/vehicles/resource-1", "/api/v1/admin/vehicles"],
  ])("adds canonical resource links for supported collection route %#", async (url, collection) => {
    const response = await request(createCollectionApp()).get(url);

    expect(response.status).toBe(200);
    expect(response.body.links.self).toBe(url);
    expect(response.body.data[0]._links).toEqual({
      self: `${collection}/resource-1`,
      collection,
    });
  });

  test("uses the standard API envelope for routing and unhandled failures", async () => {
    const app = createApp();
    const missing = await request(app).get("/api/v1/unknown");
    const failure = await request(app).get("/api/v1/failure");

    expect(missing.body).toEqual(
      expect.objectContaining({ status: 404, success: false, data: null }),
    );
    expect(failure.body).toEqual(
      expect.objectContaining({ status: 500, success: false, data: null }),
    );
  });
});
