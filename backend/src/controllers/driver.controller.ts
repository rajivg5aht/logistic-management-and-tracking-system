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
  DriverFleetIncidentUpdateDTO,
  DriverFuelExpenseDTO,
  DriverFuelExpenseUpdateDTO,
} from "../dtos/driver.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";

const shipmentService = new ShipmentService();
const userService = new UserService();

export class DriverController {
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

  async updateFleetIncident(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = DriverFleetIncidentUpdateDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const incident = await userService.updateDriverFleetIncident(
        req.user.id,
        req.params.id as string,
        parsed.data,
      );
      return ApiResponseHelper.success(
        res,
        incident,
        "Vehicle issue updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async deleteFleetIncident(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      await userService.deleteDriverFleetIncident(
        req.user.id,
        req.params.id as string,
      );
      return ApiResponseHelper.success(
        res,
        null,
        "Vehicle issue cancelled successfully",
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

      const receiptUrl = req.file
        ? `/uploads/fuel-receipts/${req.file.filename}`
        : "";
      const expense = await userService.createDriverFuelExpense(
        req.user.id,
        parsed.data,
        receiptUrl,
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

  async updateFuelExpense(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsed = DriverFuelExpenseUpdateDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const receiptUrl = req.file
        ? `/uploads/fuel-receipts/${req.file.filename}`
        : undefined;
      const expense = await userService.updateDriverFuelExpense(
        req.user.id,
        req.params.id as string,
        parsed.data,
        receiptUrl,
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

  async deleteFuelExpense(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      await userService.deleteDriverFuelExpense(
        req.user.id,
        req.params.id as string,
      );
      return ApiResponseHelper.success(
        res,
        null,
        "Fuel expense cancelled successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }
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

      const files = req.files as
        | { [field: string]: Express.Multer.File[] }
        | undefined;
      const photoFile = files?.proofPhoto?.[0];
      const signatureFile = files?.signature?.[0];
      const photoUrl = photoFile
        ? `/uploads/proofs/${photoFile.filename}`
        : undefined;
      const signatureUrl = signatureFile
        ? `/uploads/proofs/${signatureFile.filename}`
        : undefined;
      const updated = await shipmentService.driverUpsertProof(req.user.id, id, {
        ...parsed.data,
        photoUrl,
        signatureUrl,
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
