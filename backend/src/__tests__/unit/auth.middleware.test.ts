jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: { verify: jest.fn() },
}));

jest.mock("../../models/user.model", () => ({
  UserModel: { findById: jest.fn() },
}));

import type { Response } from "express";
import jwt from "jsonwebtoken";
import {
  adminMiddleware,
  authMiddleware,
  driverMiddleware,
  type AuthRequest,
} from "../../middleware/auth.middleware";
import { UserModel } from "../../models/user.model";

const verifyMock = jwt.verify as jest.Mock;
const findByIdMock = UserModel.findById as jest.Mock;

const requestMock = (authorization?: string): AuthRequest =>
  ({ headers: authorization ? { authorization } : {} }) as AuthRequest;

const responseMock = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);
  return res;
};

const resolvedUser = (user: unknown) => {
  findByIdMock.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
};

describe("Unit: authentication and role middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    verifyMock.mockReset();
    findByIdMock.mockReset();
  });

  test("rejects missing, non-Bearer, and empty authorization values", async () => {
    const missingResponse = responseMock();
    const missingNext = jest.fn();
    await authMiddleware(requestMock(), missingResponse, missingNext);
    expect(missingResponse.status).toHaveBeenCalledWith(401);
    expect(missingNext).not.toHaveBeenCalled();

    const basicResponse = responseMock();
    await authMiddleware(requestMock("Basic credentials"), basicResponse, jest.fn());
    expect(basicResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unauthorized - No token provided" }),
    );

    const emptyResponse = responseMock();
    await authMiddleware(requestMock("Bearer "), emptyResponse, jest.fn());
    expect(emptyResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unauthorized - Invalid token format" }),
    );
  });

  test("hides token verification and account lookup failures", async () => {
    verifyMock.mockImplementationOnce(() => {
      throw new Error("signature details");
    });
    const signatureResponse = responseMock();
    await authMiddleware(
      requestMock("Bearer invalid"),
      signatureResponse,
      jest.fn(),
    );
    expect(signatureResponse.status).toHaveBeenCalledWith(401);
    expect(signatureResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unauthorized - Invalid or expired token",
      }),
    );

    verifyMock.mockReturnValue({
      id: "user-1",
      email: "user@example.com",
      role: "customer",
    });
    findByIdMock.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("database unavailable")),
    });
    const lookupResponse = responseMock();
    await authMiddleware(
      requestMock("Bearer valid"),
      lookupResponse,
      jest.fn(),
    );
    expect(lookupResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unauthorized - Invalid or expired token",
      }),
    );
  });

  test("rejects deleted and inactive accounts with the correct status", async () => {
    verifyMock.mockReturnValue({
      id: "missing",
      email: "old@example.com",
      role: "customer",
    });
    resolvedUser(null);
    const missingResponse = responseMock();
    await authMiddleware(
      requestMock("Bearer valid"),
      missingResponse,
      jest.fn(),
    );
    expect(missingResponse.status).toHaveBeenCalledWith(401);
    expect(missingResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unauthorized - Account not found" }),
    );

    verifyMock.mockReturnValue({
      id: "user-1",
      email: "user@example.com",
      role: "customer",
    });
    resolvedUser({
      _id: { toString: () => "user-1" },
      email: "user@example.com",
      role: "customer",
      status: "inactive",
    });
    const inactiveResponse = responseMock();
    await authMiddleware(
      requestMock("Bearer valid"),
      inactiveResponse,
      jest.fn(),
    );
    expect(inactiveResponse.status).toHaveBeenCalledWith(403);
    expect(inactiveResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden - Account is inactive" }),
    );
  });

  test("attaches the current database identity before continuing", async () => {
    verifyMock.mockReturnValue({
      id: "user-1",
      email: "old@example.com",
      role: "customer",
    });
    resolvedUser({
      _id: { toString: () => "user-1" },
      email: "driver@example.com",
      role: "driver",
      status: "active",
    });
    const req = requestMock("Bearer valid");
    const next = jest.fn();
    await authMiddleware(req, responseMock(), next);
    expect(req.user).toEqual({
      id: "user-1",
      email: "driver@example.com",
      role: "driver",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("admin authorization rejects visitors and customers but allows admins", async () => {
    const visitorResponse = responseMock();
    await adminMiddleware(requestMock(), visitorResponse, jest.fn());
    expect(visitorResponse.status).toHaveBeenCalledWith(401);

    const customer = requestMock();
    customer.user = { id: "1", email: "user@example.com", role: "customer" };
    const customerResponse = responseMock();
    await adminMiddleware(customer, customerResponse, jest.fn());
    expect(customerResponse.status).toHaveBeenCalledWith(403);
    expect(customerResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden - Admin access required" }),
    );

    const admin = requestMock();
    admin.user = { id: "1", email: "admin@example.com", role: "admin" };
    const next = jest.fn();
    await adminMiddleware(admin, responseMock(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("driver authorization rejects visitors and admins but allows drivers", async () => {
    const visitorResponse = responseMock();
    await driverMiddleware(requestMock(), visitorResponse, jest.fn());
    expect(visitorResponse.status).toHaveBeenCalledWith(401);

    const admin = requestMock();
    admin.user = { id: "1", email: "admin@example.com", role: "admin" };
    const adminResponse = responseMock();
    await driverMiddleware(admin, adminResponse, jest.fn());
    expect(adminResponse.status).toHaveBeenCalledWith(403);
    expect(adminResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden - Driver access required" }),
    );

    const driver = requestMock();
    driver.user = { id: "1", email: "driver@example.com", role: "driver" };
    const next = jest.fn();
    await driverMiddleware(driver, responseMock(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
