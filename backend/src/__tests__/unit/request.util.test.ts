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
  test("normalizes default, positive, decimal, and invalid pagination queries", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10 });
    expect(parsePagination({ page: "3", limit: "25" })).toEqual({
      page: 3,
      limit: 25,
    });
    expect(parsePagination({ page: "4.8", limit: "12.9" })).toEqual({
      page: 4,
      limit: 12,
    });
    expect(parsePagination({ page: "not-a-page", limit: "20" })).toEqual({
      page: 1,
      limit: 20,
    });
    expect(parsePagination({ page: "0", limit: "-5" })).toEqual({
      page: 1,
      limit: 10,
    });
  });

  test("builds exact, rounded, and empty pagination metadata", () => {
    expect(buildPaginationMeta(2, 10, 20)).toEqual({
      page: 2,
      limit: 10,
      total: 20,
      totalPages: 2,
    });
    expect(buildPaginationMeta(1, 10, 21).totalPages).toBe(3);
    expect(buildPaginationMeta(1, 10, 0).totalPages).toBe(0);
  });

  test("validates generated, hexadecimal, and invalid Mongo identifiers", () => {
    expect(isObjectId(new mongoose.Types.ObjectId().toString())).toBe(true);
    expect(isObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(isObjectId("shipment-123")).toBe(false);
  });

  test("controller errors preserve an explicit HTTP status and message", () => {
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

  test("controller errors safely handle ordinary errors and non-error values", () => {
    const ordinaryResponse = responseMock();
    handleControllerError(ordinaryResponse, new Error("Database unavailable"));
    expect(ordinaryResponse.status).toHaveBeenCalledWith(500);
    expect(ordinaryResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Database unavailable", status: 500 }),
    );

    const unknownResponse = responseMock();
    handleControllerError(unknownResponse, "unexpected failure");
    expect(unknownResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal Server Error", status: 500 }),
    );
  });
});
