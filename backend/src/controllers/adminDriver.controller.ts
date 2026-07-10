import { Request, Response } from "express";
import { z } from "zod";
import { UserService } from "../services/user.service";
import { AdminCreateDriverDTO, AdminUpdateDriverDTO } from "../dtos/driver.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import {
  buildPaginationMeta,
  handleControllerError,
  isObjectId,
  parsePagination,
} from "../utils/request.util";
import { AVAILABILITY_STATUSES, type AvailabilityStatus } from "../types/user.type";

const userService = new UserService();

const isAvailabilityStatus = (value: string): value is AvailabilityStatus =>
  AVAILABILITY_STATUSES.includes(value as AvailabilityStatus);

export class AdminDriverController {
  async getDrivers(req: Request, res: Response) {
    try {
      const { page, limit } = parsePagination(req.query);
      const search = (req.query.search as string) || "";
      const availabilityParam = req.query.availability as string | undefined;
      const availability =
        availabilityParam && isAvailabilityStatus(availabilityParam)
          ? availabilityParam
          : undefined;

      const { drivers, total } = await userService.adminGetDrivers(
        page,
        limit,
        search,
        availability,
      );

      return ApiResponseHelper.success(
        res,
        drivers,
        "Drivers retrieved successfully",
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async getStats(_req: Request, res: Response) {
    try {
      const stats = await userService.adminGetDriverStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "Driver stats retrieved successfully",
      );
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async getDriverById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!isObjectId(id)) {
        return ApiResponseHelper.error(res, "Invalid driver ID", 400);
      }

      const driver = await userService.adminGetDriverById(id);
      return ApiResponseHelper.success(
        res,
        driver,
        "Driver retrieved successfully",
      );
    } catch (error: unknown) {
      return handleControllerError(res, error);
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
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async updateDriver(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!isObjectId(id)) {
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
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async deleteDriver(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!isObjectId(id)) {
        return ApiResponseHelper.error(res, "Invalid driver ID", 400);
      }

      await userService.adminDeleteDriver(id);
      return ApiResponseHelper.success(
        res,
        null,
        "Driver deleted successfully",
      );
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }
}
