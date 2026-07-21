import type { Response } from "express";
import { ApiResponseHelper } from "../../utils/apihelper.util";

const responseMock = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);
  return res;
};

describe("Unit: API response helper", () => {
  test("builds default, custom, and paginated success responses", () => {
    const defaultResponse = responseMock();
    ApiResponseHelper.success(defaultResponse, { trackingId: "CNP-001" });
    expect(defaultResponse.status).toHaveBeenCalledWith(200);
    expect(defaultResponse.json).toHaveBeenCalledWith({
      status: 200,
      success: true,
      message: "Success",
      data: { trackingId: "CNP-001" },
      meta: undefined,
    });

    const createdResponse = responseMock();
    ApiResponseHelper.success(
      createdResponse,
      { id: "new" },
      "Shipment created",
      201,
    );
    expect(createdResponse.status).toHaveBeenCalledWith(201);
    expect(createdResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Shipment created", status: 201 }),
    );

    const paginatedResponse = responseMock();
    const meta = { page: 2, limit: 10, total: 24, totalPages: 3 };
    ApiResponseHelper.success(
      paginatedResponse,
      ["shipment"],
      "Success",
      200,
      meta,
    );
    expect(paginatedResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ meta }),
    );
  });

  test("builds default and custom error responses", () => {
    const defaultResponse = responseMock();
    ApiResponseHelper.error(defaultResponse);
    expect(defaultResponse.status).toHaveBeenCalledWith(500);
    expect(defaultResponse.json).toHaveBeenCalledWith({
      status: 500,
      success: false,
      message: "Error",
      data: null,
    });

    const forbiddenResponse = responseMock();
    ApiResponseHelper.error(forbiddenResponse, "Forbidden", 403);
    expect(forbiddenResponse.status).toHaveBeenCalledWith(403);
    expect(forbiddenResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden", status: 403 }),
    );
  });
});
