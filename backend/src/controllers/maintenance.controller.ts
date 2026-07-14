import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import type { AuthRequest } from "../middleware/auth.middleware";
import { MaintenanceWorkOrderService } from "../services/maintenanceWorkOrder.service";
import { MaintenanceWorkOrderUpdateDTO } from "../dtos/maintenanceWorkOrder.dto";
import { MAINTENANCE_WORK_ORDER_STATUSES } from "../models/maintenanceWorkOrder.model";

const maintenanceWorkOrderService = new MaintenanceWorkOrderService();

function parsePaging(req: Request) {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 20, 1),
    200,
  );
  const requested = req.query.status as string | undefined;
  const status = MAINTENANCE_WORK_ORDER_STATUSES.includes(
    requested as (typeof MAINTENANCE_WORK_ORDER_STATUSES)[number],
  )
    ? requested
    : undefined;
  return { page, limit, status };
}

export class MaintenanceController {
  async getWorkOrders(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const { page, limit, status } = parsePaging(req);
      const { items, total } = await maintenanceWorkOrderService.listForMaintenance(
        req.user.id,
        { page, limit, status },
      );
      return ApiResponseHelper.success(
        res,
        items,
        "Maintenance work orders retrieved successfully",
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

  async updateWorkOrder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const body = {
        ...req.body,
        ...(req.file
          ? { invoiceUrl: "/uploads/maintenance-documents/" + req.file.filename }
          : {}),
      };
      const parsed = MaintenanceWorkOrderUpdateDTO.safeParse(body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const workOrder = await maintenanceWorkOrderService.updateAsMaintenance(
        req.params.id as string,
        parsed.data,
        req.user.id,
      );
      return ApiResponseHelper.success(
        res,
        workOrder,
        "Maintenance work order updated successfully",
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