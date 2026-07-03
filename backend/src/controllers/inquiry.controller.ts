import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  AdminUpdateInquiryDTO,
  CreateCustomerInquiryDTO,
  CreateInquiryDTO,
} from "../dtos/inquiry.dto";
import { InquiryService } from "../services/inquiry.service";
import {
  INQUIRY_CATEGORIES,
  INQUIRY_STATUSES,
  type InquiryCategory,
  type InquiryStatus,
} from "../types/inquiry.type";
import { ApiResponseHelper } from "../utils/apihelper.util";
import type { AuthRequest } from "../middleware/auth.middleware";

const inquiryService = new InquiryService();

export class InquiryController {
  async create(req: Request, res: Response) {
    try {
      const parsed = CreateInquiryDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const inquiry = await inquiryService.create(parsed.data);
      return ApiResponseHelper.success(res, inquiry, "Message sent successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async createMy(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return ApiResponseHelper.error(res, "Unauthorized", 401);
      const parsed = CreateCustomerInquiryDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const inquiry = await inquiryService.createForCustomer(req.user.id, parsed.data);
      return ApiResponseHelper.success(res, inquiry, "Inquiry created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async getMy(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return ApiResponseHelper.error(res, "Unauthorized", 401);
      const inquiries = await inquiryService.listByCustomer(req.user.id, req.user.email);
      return ApiResponseHelper.success(
        res,
        inquiries,
        "Customer inquiries retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const search = ((req.query.search as string) || "").trim();
      const statusParam = req.query.status as string | undefined;
      const categoryParam = req.query.category as string | undefined;
      const sort = req.query.sort === "oldest" ? "oldest" : "newest";
      const status = statusParam && INQUIRY_STATUSES.includes(statusParam as InquiryStatus)
        ? (statusParam as InquiryStatus)
        : undefined;
      const category = categoryParam && INQUIRY_CATEGORIES.includes(categoryParam as InquiryCategory)
        ? (categoryParam as InquiryCategory)
        : undefined;

      const result = await inquiryService.list(page, limit, { search, status, category, sort });
      return ApiResponseHelper.success(
        res,
        result.inquiries,
        "Inquiries retrieved successfully",
        200,
        { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
      );
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async stats(req: Request, res: Response) {
    try {
      return ApiResponseHelper.success(
        res,
        await inquiryService.getStats(),
        "Inquiry statistics retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid inquiry ID", 400);
      }
      return ApiResponseHelper.success(res, await inquiryService.getById(id), "Inquiry retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid inquiry ID", 400);
      }
      const parsed = AdminUpdateInquiryDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      return ApiResponseHelper.success(res, await inquiryService.update(id, parsed.data), "Inquiry updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseHelper.error(res, "Invalid inquiry ID", 400);
      }
      await inquiryService.delete(id);
      return ApiResponseHelper.success(res, null, "Inquiry deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }
}
