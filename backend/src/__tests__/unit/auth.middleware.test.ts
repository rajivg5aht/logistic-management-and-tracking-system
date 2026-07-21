jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: { verify: jest.fn() },
}));

jest.mock("../../models/user.model", () => ({
  UserModel: { findById: jest.fn() },
}));

import type { NextFunction, Response } from "express";
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
  });

  test("authentication rejects a request without an authorization header", async () => {
    const res = responseMock();
    const next = jest.fn();

    await authMiddleware(requestMock(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("authentication rejects a non-Bearer authorization scheme", async () => {
    const res = responseMock();

    await authMiddleware(requestMock("Basic credentials"), res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unauthorized - No token provided" }),
    );
  });

  test("authentication rejects an empty Bearer token", async () => {
    const res = responseMock();

    await authMiddleware(requestMock("Bearer "), res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unauthorized - Invalid token format" }),
    );
  });

  test("authentication converts signature errors into a safe 401 response", async () => {
    verifyMock.mockImplementation(() => {
      throw new Error("signature details");
    });
    const res = responseMock();

    await authMiddleware(requestMock("Bearer invalid"), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unauthorized - Invalid or expired token",
      }),
    );
  });

  test("authentication rejects a token whose account no longer exists", async () => {
    verifyMock.mockReturnValue({ id: "missing", email: "old@example.com", role: "customer" });
    resolvedUser(null);
    const res = responseMock();

    await authMiddleware(requestMock("Bearer valid"), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unauthorized - Account not found" }),
    );
  });

  test("authentication blocks an inactive account", async () => {
    verifyMock.mockReturnValue({ id: "user-1", email: "user@example.com", role: "customer" });
    resolvedUser({
      _id: { toString: () => "user-1" },
      email: "user@example.com",
      role: "customer",
      status: "inactive",
    });
    const res = responseMock();

    await authMiddleware(requestMock("Bearer valid"), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden - Account is inactive" }),
    );
  });

  test("authentication attaches the current database role before continuing", async () => {
    verifyMock.mockReturnValue({ id: "user-1", email: "old@example.com", role: "customer" });
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

  test("authentication handles account lookup failures without leaking details", async () => {
    verifyMock.mockReturnValue({ id: "user-1", email: "user@example.com", role: "customer" });
    findByIdMock.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("database unavailable")),
    });
    const res = responseMock();

    await authMiddleware(requestMock("Bearer valid"), res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unauthorized - Invalid or expired token",
      }),
    );
  });

  test("admin authorization requires an authenticated user", async () => {
    const res = responseMock();

    await adminMiddleware(requestMock(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("admin authorization rejects a customer", async () => {
    const req = requestMock();
    req.user = { id: "1", email: "user@example.com", role: "customer" };
    const res = responseMock();

    await adminMiddleware(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden - Admin access required" }),
    );
  });

  test("admin authorization allows an administrator", async () => {
    const req = requestMock();
    req.user = { id: "1", email: "admin@example.com", role: "admin" };
    const next = jest.fn() as NextFunction;

    await adminMiddleware(req, responseMock(), next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("driver authorization requires an authenticated user", async () => {
    const res = responseMock();

    await driverMiddleware(requestMock(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("driver authorization rejects an administrator", async () => {
    const req = requestMock();
    req.user = { id: "1", email: "admin@example.com", role: "admin" };
    const res = responseMock();

    await driverMiddleware(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden - Driver access required" }),
    );
  });

  test("driver authorization allows a driver", async () => {
    const req = requestMock();
    req.user = { id: "1", email: "driver@example.com", role: "driver" };
    const next = jest.fn() as NextFunction;

    await driverMiddleware(req, responseMock(), next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
