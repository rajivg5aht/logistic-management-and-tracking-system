import { Request, Response } from "express";
import { z } from "zod";
import { UserService } from "../services/user.service";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  buildPaginationMeta,
  handleControllerError,
  isObjectId,
  parsePagination,
} from "../utils/request.util";

const userService = new UserService();

const normalizeUserBody = (body: Record<string, unknown>) => {
  const normalized = { ...body };

  if (typeof normalized.name === "string" && !normalized.fullName) {
    normalized.fullName = normalized.name;
  }
  delete normalized.name;

  return normalized;
};

export class AdminController {
  async getUsers(req: Request, res: Response) {
    try {
      const { page, limit } = parsePagination(req.query);
      const search = (req.query.search as string) || "";
      const requestedRole = req.query.role as string | undefined;
      const role =
        requestedRole && ["admin", "customer", "driver"].includes(requestedRole)
          ? requestedRole
          : undefined;

      const { users, total } = await userService.adminGetUsers(
        page,
        limit,
        search,
        role,
      );

      return ApiResponseHelper.success(
        res,
        users,
        "Users retrieved successfully",
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async getUserStats(_req: Request, res: Response) {
    try {
      const stats = await userService.adminGetUserStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "User stats retrieved successfully",
      );
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!isObjectId(id)) {
        return ApiResponseHelper.error(res, "Invalid user ID", 400);
      }

      const user = await userService.getUserById(id);
      return ApiResponseHelper.success(res, user, "User retrieved successfully");
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const body = normalizeUserBody(req.body as Record<string, unknown>);

      if (body.role && body.role !== "customer") {
        return ApiResponseHelper.error(
          res,
          "Drivers must be created in Driver Management",
          400,
        );
      }

      const parsedData = AdminCreateUserDTO.safeParse(body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsedData.error),
          400,
        );
      }

      const user = await userService.adminCreateUser(parsedData.data);
      return ApiResponseHelper.success(res, user, "User created successfully", 201);
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      if (!isObjectId(id)) {
        return ApiResponseHelper.error(res, "Invalid user ID", 400);
      }

      if (req.user?.id === id) {
        return ApiResponseHelper.error(
          res,
          "Forbidden - Administrators cannot edit or modify their own accounts in the management panel",
          403,
        );
      }

      const body = normalizeUserBody(req.body as Record<string, unknown>);
      if (body.role !== undefined) {
        return ApiResponseHelper.error(
          res,
          "Roles cannot be changed in User Management",
          400,
        );
      }

      const parsedData = AdminUpdateUserDTO.safeParse(body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsedData.error),
          400,
        );
      }

      const updatedUser = await userService.adminUpdateUser(id, parsedData.data);
      return ApiResponseHelper.success(
        res,
        updatedUser,
        "User updated successfully",
      );
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      if (!isObjectId(id)) {
        return ApiResponseHelper.error(res, "Invalid user ID", 400);
      }

      if (req.user?.id === id) {
        return ApiResponseHelper.error(
          res,
          "Forbidden - Administrators cannot delete their own accounts",
          403,
        );
      }

      await userService.adminDeleteUser(id);
      return ApiResponseHelper.success(res, null, "User deleted successfully");
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }
}
