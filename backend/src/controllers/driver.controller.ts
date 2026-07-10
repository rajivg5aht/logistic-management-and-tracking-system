import { Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { ShipmentService } from "../services/shipment.service";
import { UserService } from "../services/user.service";
import {
  DriverStageUpdateDTO,
  DriverAvailabilityDTO,
  DriverCodUpdateDTO,
  DriverProofUpdateDTO,
  DriverFleetIncidentDTO,
  DriverFuelExpenseDTO,
} from "../dtos/driver.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";

const shipmentService = new ShipmentService();
const userService = new UserService();

export class DriverController {
  // -- Driver: my profile + assigned vehicle --------------------------------
  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const me = await userService.getDriverMe(req.user.id);
      return ApiResponseHelper.success(
        res,
        me,
        "Driver profile retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // -- Driver: assigned fleet details --------------------------------------
  async getFleet(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const fleet = await userService.getDriverFleet(req.user.id);
      return ApiResponseHelper.success(
        res,
        fleet,
        "Driver fleet retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async reportFleetIncident(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = DriverFleetIncidentDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const incident = await userService.createDriverFleetIncident(
        req.user.id,
        parsed.data,
      );
      return ApiResponseHelper.success(
        res,
        incident,
        "Vehicle issue reported successfully",
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

  async logFuelExpense(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = DriverFuelExpenseDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const expense = await userService.createDriverFuelExpense(
        req.user.id,
        parsed.data,
      );
      return ApiResponseHelper.success(
        res,
        expense,
        "Fuel expense submitted successfully",
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

  // -- Driver: list shipments assigned to me --------------------------------
  async getMyAssignments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const scopeParam = req.query.scope as string | undefined;
      const scope =
        scopeParam === "active" || scopeParam === "history"
          ? scopeParam
          : undefined;

      const shipments = await shipmentService.getMyAssignments(
        req.user.id,
        scope,
      );
      return ApiResponseHelper.success(
        res,
        shipments,
        "Assignments retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // -- Driver: get one of my assignments ------------------------------------
  async getAssignmentById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const shipment = await shipmentService.getMyAssignmentById(
        req.user.id,
        id,
      );
      return ApiResponseHelper.success(
        res,
        shipment,
        "Assignment retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // -- Driver: advance the delivery stage -----------------------------------
  async updateStage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const parsed = DriverStageUpdateDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const updated = await shipmentService.driverUpdateStage(
        req.user.id,
        id,
        parsed.data,
      );
      return ApiResponseHelper.success(
        res,
        updated,
        "Delivery stage updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // Driver: create/update proof of delivery
  async upsertProof(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const parsed = DriverProofUpdateDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const photoUrl = req.file
        ? `/uploads/proofs/${req.file.filename}`
        : undefined;
      const updated = await shipmentService.driverUpsertProof(req.user.id, id, {
        ...parsed.data,
        photoUrl,
      });
      return ApiResponseHelper.success(
        res,
        updated,
        "Proof of delivery saved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async deleteProof(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const updated = await shipmentService.driverDeleteProof(req.user.id, id);
      return ApiResponseHelper.success(
        res,
        updated,
        "Proof of delivery removed successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // Driver: record COD cash collection
  async collectCod(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid shipment ID", 400);
      }

      const parsed = DriverCodUpdateDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const updated = await shipmentService.driverCollectCod(
        req.user.id,
        id,
        parsed.data.collected,
      );
      return ApiResponseHelper.success(
        res,
        updated,
        "COD payment updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // -- Driver: my dashboard stats -------------------------------------------
  async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const stats = await shipmentService.getDriverStats(req.user.id);
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

  // -- Driver: toggle my own availability -----------------------------------
  async updateAvailability(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = DriverAvailabilityDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const updated = await userService.updateAvailability(
        req.user.id,
        parsed.data.availabilityStatus,
      );
      return ApiResponseHelper.success(
        res,
        updated,
        "Availability updated successfully",
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
