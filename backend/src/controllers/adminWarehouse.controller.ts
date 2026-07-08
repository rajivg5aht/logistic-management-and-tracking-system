import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { WarehouseService } from "../services/warehouse.service";
import {
  AdminCreateWarehouseDTO,
  AdminUpdateWarehouseDTO,
} from "../dtos/warehouse.dto";
import {
  WAREHOUSE_STATUSES,
  WarehouseStatus,
} from "../models/warehouse.model";

const warehouseService = new WarehouseService();

export class AdminWarehouseController {
  async getWarehouses(req: Request, res: Response) {
    try {
      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 10, 1),
        200,
      );
      const search = (req.query.search as string) || "";
      const requestedStatus = req.query.status as string | undefined;
      const status =
        requestedStatus &&
        WAREHOUSE_STATUSES.includes(requestedStatus as WarehouseStatus)
          ? (requestedStatus as WarehouseStatus)
          : undefined;
      const { warehouses, total } = await warehouseService.getWarehouses(
        page,
        limit,
        search,
        status,
      );
      return ApiResponseHelper.success(
        res,
        warehouses,
        "Warehouses retrieved successfully",
        200,
        { page, limit, total, totalPages: Math.ceil(total / limit) },
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getStats(_req: Request, res: Response) {
    try {
      const stats = await warehouseService.getStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "Warehouse statistics retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getOptions(_req: Request, res: Response) {
    try {
      const options = await warehouseService.getOptions();
      return ApiResponseHelper.success(
        res,
        options,
        "Warehouse options retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getWarehouseById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid warehouse ID", 400);
      }
      const warehouse = await warehouseService.getWarehouseById(id);
      return ApiResponseHelper.success(
        res,
        warehouse,
        "Warehouse retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async createWarehouse(req: Request, res: Response) {
    try {
      const parsed = AdminCreateWarehouseDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const warehouse = await warehouseService.createWarehouse(parsed.data);
      return ApiResponseHelper.success(
        res,
        warehouse,
        "Warehouse created successfully",
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

  async updateWarehouse(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid warehouse ID", 400);
      }
      const parsed = AdminUpdateWarehouseDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const warehouse = await warehouseService.updateWarehouse(id, parsed.data);
      return ApiResponseHelper.success(
        res,
        warehouse,
        "Warehouse updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async deactivateWarehouse(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid warehouse ID", 400);
      }
      await warehouseService.deactivateWarehouse(id);
      return ApiResponseHelper.success(
        res,
        null,
        "Warehouse deactivated successfully",
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
