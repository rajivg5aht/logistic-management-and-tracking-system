import type { Response } from "express";
import { z } from "zod";
import { HttpException } from "../../exceptions/http-exception";
import { errorMiddleware } from "../../middleware/error.middleware";

const responseMock = () => {
  const res = { headersSent: false, status: jest.fn(), json: jest.fn() } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);
  return res;
};

const zodError = (() => {
  try {
    z.object({ trackingId: z.string().min(1) }).parse({ trackingId: "" });
  } catch (error) {
    return error;
  }
  throw new Error("Expected Zod validation to fail");
})();

describe("Unit: error middleware response mapping", () => {
  test.each([
    [new HttpException(400, "Invalid shipment ID"), 400, "Invalid shipment ID"],
    [new HttpException(401, "Unauthorized"), 401, "Unauthorized"],
    [new HttpException(403, "Forbidden"), 403, "Forbidden"],
    [new HttpException(404, "Shipment not found"), 404, "Shipment not found"],
    [new HttpException(409, "Shipment is already cancelled"), 409, "Shipment is already cancelled"],
    [zodError, 400, undefined],
    [Object.assign(new Error("Duplicate key"), { code: 11000 }), 409, "A record with this value already exists"],
    [Object.assign(new Error("Validation failed"), { name: "ValidationError" }), 400, "Validation failed"],
  ])("maps known failure to a safe HTTP response", (error, status, message) => {
    const res = responseMock();

    errorMiddleware(error, {} as never, res, (() => undefined) as never);

    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status,
        success: false,
        data: null,
        ...(message ? { message } : {}),
      }),
    );
  });
});
