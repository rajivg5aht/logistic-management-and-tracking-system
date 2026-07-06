import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { ShipmentService } from "../services/shipment.service";
import {
  CreateShipmentDTO,
  AdminUpdateShipmentDTO,
  CustomerUpdateShipmentDTO,
} from "../dtos/shipment.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";
import { SHIPMENT_STATUSES, ShipmentStatus } from "../types/shipment.type";

const shipmentService = new ShipmentService();

export class ShipmentController {
  // ── Customer: create a shipment (confirm & pay) ──────────────────────────
  async createShipment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = CreateShipmentDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const shipment = await shipmentService.createShipment(
        req.user.id,
        parsed.data,
      );

      return ApiResponseHelper.success(
        res,
        shipment,
        "Shipment created successfully",
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

  // ── Customer: list own shipments ─────────────────────────────────────────
  async getMyShipments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const shipments = await shipmentService.getMyShipments(req.user.id);
      return ApiResponseHelper.success(
        res,
        shipments,
        "Shipments retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Customer: edit own pending shipment ──────────────────────────────────
  async customerUpdateShipment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const parsed = CustomerUpdateShipmentDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const updated = await shipmentService.customerUpdateShipment(
        req.user.id,
        id,
        parsed.data,
      );
      return ApiResponseHelper.success(
        res,
        updated,
        "Shipment updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Customer: cancel own pending shipment ────────────────────────────────
  async customerCancelShipment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const updated = await shipmentService.customerCancelShipment(
        req.user.id,
        id,
      );
      return ApiResponseHelper.success(
        res,
        updated,
        "Shipment cancelled successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Customer: delete own cancelled shipment ──────────────────────────────
  async customerDeleteShipment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      await shipmentService.customerDeleteShipment(req.user.id, id);
      return ApiResponseHelper.success(
        res,
        null,
        "Shipment deleted successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // Customer: clear delivered/cancelled shipment history while retaining all
  // active operational records.
  async customerDeleteHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const deletedCount = await shipmentService.customerDeleteHistory(
        req.user.id,
      );
      return ApiResponseHelper.success(
        res,
        { deletedCount },
        "Shipment history deleted successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Admin: paginated list ────────────────────────────────────────────────
  async adminGetShipments(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const statusParam = req.query.status as string | undefined;
      const status =
        statusParam && SHIPMENT_STATUSES.includes(statusParam as ShipmentStatus)
          ? (statusParam as ShipmentStatus)
          : undefined;

      const { shipments, total } = await shipmentService.adminGetShipments(
        page,
        limit,
        search,
        status,
      );
      const totalPages = Math.ceil(total / limit);

      return ApiResponseHelper.success(
        res,
        shipments,
        "Shipments retrieved successfully",
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

  // ── Admin: aggregated stats for KPI cards ────────────────────────────────
  async adminGetStats(req: Request, res: Response) {
    try {
      const stats = await shipmentService.getStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "Shipment stats retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Admin: get one ───────────────────────────────────────────────────────
  async adminGetShipmentById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const shipment = await shipmentService.adminGetShipmentById(id);
      return ApiResponseHelper.success(
        res,
        shipment,
        "Shipment retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Admin: update (status / driver) ──────────────────────────────────────
  async adminUpdateShipment(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const parsed = AdminUpdateShipmentDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const updated = await shipmentService.adminUpdateShipment(id, parsed.data);
      return ApiResponseHelper.success(
        res,
        updated,
        "Shipment updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // ── Admin: delete ────────────────────────────────────────────────────────
  async adminDeleteShipment(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      await shipmentService.adminDeleteShipment(id);
      return ApiResponseHelper.success(
        res,
        null,
        "Shipment deleted successfully",
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
