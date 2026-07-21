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
  test("success returns a standard 200 response by default", () => {
    const res = responseMock();

    ApiResponseHelper.success(res, { trackingId: "CNP-001" });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      success: true,
      message: "Success",
      data: { trackingId: "CNP-001" },
      meta: undefined,
    });
  });

  test("success supports a custom message and status", () => {
    const res = responseMock();

    ApiResponseHelper.success(res, { id: "new" }, "Shipment created", 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Shipment created", status: 201 }),
    );
  });

  test("success includes pagination metadata", () => {
    const res = responseMock();
    const meta = { page: 2, limit: 10, total: 24, totalPages: 3 };

    ApiResponseHelper.success(res, ["shipment"], "Success", 200, meta);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ meta }));
  });

  test("error returns a standard 500 response by default", () => {
    const res = responseMock();

    ApiResponseHelper.error(res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      success: false,
      message: "Error",
      data: null,
    });
  });

  test("error supports a custom status and message", () => {
    const res = responseMock();

    ApiResponseHelper.error(res, "Forbidden", 403);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden", status: 403 }),
    );
  });
});
