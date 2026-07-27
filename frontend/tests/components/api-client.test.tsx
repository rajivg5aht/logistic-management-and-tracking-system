import { afterEach, describe, expect, test, vi } from "vitest";
import {
  apiRequest,
  apiResponse,
  buildQueryString,
} from "@/lib/api/api-client";

afterEach(() => vi.unstubAllGlobals());

describe("API client contract helpers", () => {
  test.each([
    [{}, ""],
    [{ page: 1 }, "?page=1"],
    [{ limit: 25 }, "?limit=25"],
    [{ search: "Kathmandu" }, "?search=Kathmandu"],
    [{ status: "in-transit" }, "?status=in-transit"],
    [{ active: true }, "?active=true"],
    [{ active: false }, "?active=false"],
    [{ page: 2, limit: 10 }, "?page=2&limit=10"],
    [{ search: "Pokhara & Lalitpur" }, "?search=Pokhara+%26+Lalitpur"],
    [{ page: null, limit: undefined }, ""],
    [{ search: "", page: 3 }, "?page=3"],
    [{ sort: "-updatedAt", page: 4 }, "?sort=-updatedAt&page=4"],
  ])("builds the expected query string", (params, expected) => {
    expect(buildQueryString(params)).toBe(expected);
  });

  test.each([
    ["/api/v1/shipments", { id: "shipment-1" }],
    ["/api/v1/vehicles", { id: "vehicle-1" }],
    ["/api/v1/inquiries", { id: "inquiry-1" }],
    ["/api/v1/payments", { id: "payment-1" }],
    ["/api/v1/announcements", { id: "announcement-1" }],
    ["/api/v1/driver/me", { id: "driver-1" }],
    ["/api/v1/auth/whoami", { id: "user-1" }],
    ["/api/v1/track/LN-100001", { trackingId: "LN-100001" }],
  ])("returns data for successful API responses", async (endpoint, data) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ status: 200, success: true, message: "Success", data }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest(endpoint)).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      endpoint,
      expect.objectContaining({ credentials: "include" }),
    );
  });

  test.each([
    [400, "Invalid request"],
    [401, "Unauthorized"],
    [403, "Forbidden"],
    [404, "Not found"],
  ])("surfaces a %i API failure", async (status, message) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status,
      statusText: message,
      json: async () => ({ status, success: false, message, data: null }),
    }));

    await expect(apiResponse("/api/v1/example")).rejects.toMatchObject({ status, message });
  });
});
