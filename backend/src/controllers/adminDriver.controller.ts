import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { UserService } from "../services/user.service";
import { AdminCreateDriverDTO, AdminUpdateDriverDTO } from "../dtos/driver.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AVAILABILITY_STATUSES } from "../types/user.type";

const userService = new UserService();

export class AdminDriverController {
  // ── List drivers (paginated, searchable, filterable by availability) ───────
  async getDrivers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const availabilityParam = req.query.availability as string | undefined;
      const availability =
        availabilityParam &&
        AVAILABILITY_STATUSES.includes(availabilityParam as any)
          ? availabilityParam
          : undefined;

      const { drivers, total } = await userService.adminGetDrivers(
        page,
        limit,
        search,
        availability,
      );
      const totalPages = Math.ceil(total / limit);

      return ApiResponseHelper.success(
        res,
        drivers,
        "Drivers retrieved successfully",
        200,
        { page, limit, total, totalPages },
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Aggregate KPI counts for the driver-management cards ───────────────────
  async getStats(_req: Request, res: Response) {
    try {
      const stats = await userService.adminGetDriverStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "Driver stats retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getDriverById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid driver ID", 400);
      }

      const driver = await userService.adminGetDriverById(id);
      return ApiResponseHelper.success(
        res,
        driver,
        "Driver retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async createDriver(req: Request, res: Response) {
    try {
      const parsed = AdminCreateDriverDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const driver = await userService.adminCreateDriver(parsed.data);
      return ApiResponseHelper.success(
        res,
        driver,
        "Driver created successfully",
        201,
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async updateDriver(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid driver ID", 400);
      }

      const parsed = AdminUpdateDriverDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const updated = await userService.adminUpdateDriver(id, parsed.data);
      return ApiResponseHelper.success(
        res,
        updated,
        "Driver updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async deleteDriver(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid driver ID", 400);
      }

      await userService.adminDeleteDriver(id);
      return ApiResponseHelper.success(
        res,
        null,
        "Driver deleted successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }
}
