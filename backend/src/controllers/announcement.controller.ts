import { Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { CreateAnnouncementDTO } from "../dtos/announcement.dto";
import type { AuthRequest } from "../middleware/auth.middleware";
import { AnnouncementService } from "../services/announcement.service";
import type { AnnouncementRecipientRole } from "../types/announcement.type";
import { ApiResponseHelper } from "../utils/apihelper.util";

const announcementService = new AnnouncementService();

export class AnnouncementController {
  async listForCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return ApiResponseHelper.error(res, "Unauthorized", 401);
      if (req.user.role !== "customer" && req.user.role !== "driver") {
        return ApiResponseHelper.error(
          res,
          "Announcements are available to customers and drivers",
          403,
        );
      }

      const announcements = await announcementService.listForRole(
        req.user.role as AnnouncementRecipientRole,
      );
      return ApiResponseHelper.success(
        res,
        announcements,
        "Announcements retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async listAll(_req: AuthRequest, res: Response) {
    try {
      return ApiResponseHelper.success(
        res,
        await announcementService.listAll(),
        "Announcements retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return ApiResponseHelper.error(res, "Unauthorized", 401);
      const parsed = CreateAnnouncementDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const announcement = await announcementService.create(req.user.id, parsed.data);
      return ApiResponseHelper.success(
        res,
        announcement,
        "Announcement published successfully",
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

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid announcement ID", 400);
      }
      await announcementService.delete(id);
      return ApiResponseHelper.success(
        res,
        null,
        "Announcement deleted successfully",
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
