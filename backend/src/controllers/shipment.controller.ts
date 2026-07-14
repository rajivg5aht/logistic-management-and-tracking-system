import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { ShipmentService } from "../services/shipment.service";
import { TrackingService } from "../services/tracking.service";
import {
  CreateShipmentDTO,
  AdminUpdateShipmentDTO,
  CustomerUpdateShipmentDTO,
} from "../dtos/shipment.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";
import { SHIPMENT_STATUSES, ShipmentStatus } from "../types/shipment.type";

const shipmentService = new ShipmentService();
const trackingService = new TrackingService();

export class ShipmentController {
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

  async getShipmentLocation(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      await trackingService.assertCanRead(
        { id: req.user.id, role: req.user.role },
        id,
      );
      const location = await trackingService.getLatestLocation(id);

      return ApiResponseHelper.success(
        res,
        location,
        "Shipment location retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

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

  async adminGetAnalytics(req: Request, res: Response) {
    try {
      const analytics = await shipmentService.getAnalytics();
      return ApiResponseHelper.success(
        res,
        analytics,
        "Shipment analytics retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

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
