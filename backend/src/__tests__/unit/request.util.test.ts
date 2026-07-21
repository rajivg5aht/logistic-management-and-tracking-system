import mongoose from "mongoose";
import type { Response } from "express";
import {
  buildPaginationMeta,
  handleControllerError,
  isObjectId,
  parsePagination,
} from "../../utils/request.util";

const responseMock = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);
  return res;
};

describe("Unit: request utilities", () => {
  test("pagination uses defaults when the query is empty", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10 });
  });

  test("pagination accepts positive numeric strings", () => {
    expect(parsePagination({ page: "3", limit: "25" })).toEqual({
      page: 3,
      limit: 25,
    });
  });

  test("pagination converts decimal strings to whole numbers", () => {
    expect(parsePagination({ page: "4.8", limit: "12.9" })).toEqual({
      page: 4,
      limit: 12,
    });
  });

  test("pagination replaces an invalid page with the default", () => {
    expect(parsePagination({ page: "not-a-page", limit: "20" })).toEqual({
      page: 1,
      limit: 20,
    });
  });

  test("pagination replaces zero and negative values", () => {
    expect(parsePagination({ page: "0", limit: "-5" })).toEqual({
      page: 1,
      limit: 10,
    });
  });

  test("pagination metadata preserves the supplied values", () => {
    expect(buildPaginationMeta(2, 10, 20)).toEqual({
      page: 2,
      limit: 10,
      total: 20,
      totalPages: 2,
    });
  });

  test("pagination metadata rounds partial pages upward", () => {
    expect(buildPaginationMeta(1, 10, 21).totalPages).toBe(3);
  });

  test("pagination metadata reports zero pages for an empty result", () => {
    expect(buildPaginationMeta(1, 10, 0).totalPages).toBe(0);
  });

  test("object id validation accepts a generated Mongo id", () => {
    expect(isObjectId(new mongoose.Types.ObjectId().toString())).toBe(true);
  });

  test("object id validation accepts a 24-character hexadecimal id", () => {
    expect(isObjectId("507f1f77bcf86cd799439011")).toBe(true);
  });

  test("object id validation rejects ordinary text", () => {
    expect(isObjectId("shipment-123")).toBe(false);
  });

  test("controller errors preserve an explicit HTTP status", () => {
    const res = responseMock();
    const error = Object.assign(new Error("Shipment not found"), { status: 404 });

    handleControllerError(res, error);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      success: false,
      message: "Shipment not found",
      data: null,
    });
  });

  test("controller errors default ordinary errors to status 500", () => {
    const res = responseMock();

    handleControllerError(res, new Error("Database unavailable"));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Database unavailable", status: 500 }),
    );
  });

  test("controller errors hide non-error values behind a safe message", () => {
    const res = responseMock();

    handleControllerError(res, "unexpected failure");

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal Server Error", status: 500 }),
    );
  });
});
