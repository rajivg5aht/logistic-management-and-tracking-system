import { describe, expect, test } from "vitest";
import { buildQueryString } from "@/lib/api/api-client";

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
});
