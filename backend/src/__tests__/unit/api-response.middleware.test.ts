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
