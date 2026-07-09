import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import mongoose from "mongoose";
import { z } from "zod";

const userService = new UserService();

export class AdminController {
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
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
      const totalPages = Math.ceil(total / limit);

      return ApiResponseHelper.success(
        res,
        users,
        "Users retrieved successfully",
        200,
        {
          page,
          limit,
          total,
          totalPages,
        }
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
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
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid user ID", 400);
      }

      const user = await userService.getUserById(id);
      return ApiResponseHelper.success(res, user, "User retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const body = { ...req.body };
      // Map name to fullName if provided by frontend
      if (body.name && !body.fullName) {
        body.fullName = body.name;
      }

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
          400
        );
      }

      const user = await userService.adminCreateUser(parsedData.data);
      return ApiResponseHelper.success(res, user, "User created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid user ID", 400);
      }

      // Security: Administrators cannot modify their own accounts in this panel
      const authReq = req as any;
      if (authReq.user?.id === id) {
        return ApiResponseHelper.error(
          res,
          "Forbidden - Administrators cannot edit or modify their own accounts in the management panel",
          403
        );
      }

      const body = { ...req.body };
      // Map name to fullName if provided by frontend
      if (body.name && !body.fullName) {
        body.fullName = body.name;
      }

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
          400
        );
      }

      const updatedUser = await userService.adminUpdateUser(id, parsedData.data);
      return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid user ID", 400);
      }

      // Security: Administrators cannot delete their own accounts
      const authReq = req as any;
      if (authReq.user?.id === id) {
        return ApiResponseHelper.error(
          res,
          "Forbidden - Administrators cannot delete their own accounts",
          403
        );
      }

      await userService.adminDeleteUser(id);
      return ApiResponseHelper.success(res, null, "User deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}
