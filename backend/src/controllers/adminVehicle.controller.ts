import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { VehicleService } from "../services/vehicle.service";
import {
  AdminAssignVehicleDTO,
  AdminCreateVehicleDTO,
  AdminUpdateVehicleDTO,
} from "../dtos/vehicle.dto";
import {
  VEHICLE_STATUSES,
  VehicleStatus,
} from "../models/vehicle.model";

const vehicleService = new VehicleService();

export class AdminVehicleController {
  async getVehicles(req: Request, res: Response) {
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
        VEHICLE_STATUSES.includes(requestedStatus as VehicleStatus)
          ? (requestedStatus as VehicleStatus)
          : undefined;
      const { vehicles, total } = await vehicleService.getVehicles(
        page,
        limit,
        search,
        status,
      );
      return ApiResponseHelper.success(
        res,
        vehicles,
        "Vehicles retrieved successfully",
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
      const stats = await vehicleService.getStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "Fleet statistics retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getVehicleById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
      }
      const vehicle = await vehicleService.getVehicleById(id);
      return ApiResponseHelper.success(
        res,
        vehicle,
        "Vehicle retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async createVehicle(req: Request, res: Response) {
    try {
      const parsed = AdminCreateVehicleDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const vehicle = await vehicleService.createVehicle(parsed.data);
      return ApiResponseHelper.success(
        res,
        vehicle,
        "Vehicle created successfully",
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

  async updateVehicle(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
      }
      const parsed = AdminUpdateVehicleDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const vehicle = await vehicleService.updateVehicle(id, parsed.data);
      return ApiResponseHelper.success(
        res,
        vehicle,
        "Vehicle updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async uploadVehicleImage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
      }
      if (!req.file) {
        return ApiResponseHelper.error(res, "No image file provided", 400);
      }
      const imageUrl = `/uploads/vehicles/${req.file.filename}`;
      const vehicle = await vehicleService.setVehicleImage(id, imageUrl);
      return ApiResponseHelper.success(
        res,
        vehicle,
        "Vehicle image updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async assignDriver(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
      }
      const parsed = AdminAssignVehicleDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      if (
        parsed.data.driverId &&
        !mongoose.Types.ObjectId.isValid(parsed.data.driverId)
      ) {
        return ApiResponseHelper.error(res, "Invalid driver ID", 400);
      }
      const vehicle = await vehicleService.assignDriver(
        id,
        parsed.data.driverId,
      );
      return ApiResponseHelper.success(
        res,
        vehicle,
        parsed.data.driverId
          ? "Driver assigned successfully"
          : "Driver unassigned successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async deactivateVehicle(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid vehicle ID", 400);
      }
      await vehicleService.deactivateVehicle(id);
      return ApiResponseHelper.success(
        res,
        null,
        "Vehicle deactivated successfully",
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
