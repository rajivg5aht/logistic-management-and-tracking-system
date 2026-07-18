import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { FleetReportService } from "../services/fleetReport.service";
import {
  AdminIncidentUpdateDTO,
  AdminFuelExpenseUpdateDTO,
} from "../dtos/fleetReport.dto";
import { VEHICLE_INCIDENT_STATUSES } from "../models/vehicleIncident.model";
import { VEHICLE_FUEL_EXPENSE_STATUSES } from "../models/vehicleFuelExpense.model";
import type { AuthRequest } from "../middleware/auth.middleware";

const fleetReportService = new FleetReportService();

function parsePaging(req: Request) {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 20, 1),
    200,
  );
  const vehicleId = (req.query.vehicleId as string) || undefined;
  return { page, limit, vehicleId };
}

export class AdminFleetReportController {
  async getIncidents(req: Request, res: Response) {
    try {
      const { page, limit, vehicleId } = parsePaging(req);
      const requested = req.query.status as string | undefined;
      const status = VEHICLE_INCIDENT_STATUSES.includes(
        requested as (typeof VEHICLE_INCIDENT_STATUSES)[number],
      )
        ? requested
        : undefined;

      const { items, total } = await fleetReportService.listIncidents({
        status,
        vehicleId,
        page,
        limit,
      });
      return ApiResponseHelper.success(
        res,
        items,
        "Incidents retrieved successfully",
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

  async updateIncident(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = AdminIncidentUpdateDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const incident = await fleetReportService.updateIncident(
        req.params.id as string,
        parsed.data,
        req.user.id,
      );
      return ApiResponseHelper.success(
        res,
        incident,
        "Incident reviewed successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getFuelExpenses(req: Request, res: Response) {
    try {
      const { page, limit, vehicleId } = parsePaging(req);
      const requested = req.query.status as string | undefined;
      const status = VEHICLE_FUEL_EXPENSE_STATUSES.includes(
        requested as (typeof VEHICLE_FUEL_EXPENSE_STATUSES)[number],
      )
        ? requested
        : undefined;

      const { items, total } = await fleetReportService.listFuelExpenses({
        status,
        vehicleId,
        page,
        limit,
      });
      return ApiResponseHelper.success(
        res,
        items,
        "Fuel expenses retrieved successfully",
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

  async updateFuelExpense(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = AdminFuelExpenseUpdateDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const expense = await fleetReportService.updateFuelExpense(
        req.params.id as string,
        parsed.data,
        req.user.id,
      );
      return ApiResponseHelper.success(
        res,
        expense,
        "Fuel expense updated successfully",
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
      const stats = await fleetReportService.getStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "Fleet report stats retrieved successfully",
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
