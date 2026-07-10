import { Request, Response } from "express";
import { z } from "zod";
import { PaymentService } from "../services/payment.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";
import { AdminSettleCodDTO, AdminRefundDTO } from "../dtos/payment.dto";
import { PAYMENT_STATUSES, PAYMENT_TYPES } from "../models/payment.model";
import { PAYMENT_METHODS } from "../types/shipment.type";

const paymentService = new PaymentService();

export class AdminPaymentController {
  async getPayments(req: Request, res: Response) {
    try {
      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 20, 1),
        200,
      );

      const statusQ = req.query.status as string | undefined;
      const methodQ = req.query.method as string | undefined;
      const typeQ = req.query.type as string | undefined;

      const status = PAYMENT_STATUSES.includes(statusQ as any)
        ? statusQ
        : undefined;
      const method = PAYMENT_METHODS.includes(methodQ as any)
        ? methodQ
        : undefined;
      const type = PAYMENT_TYPES.includes(typeQ as any) ? typeQ : undefined;

      const { items, total } = await paymentService.listPayments({
        status,
        method,
        type,
        page,
        limit,
      });
      return ApiResponseHelper.success(
        res,
        items,
        "Payments retrieved successfully",
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
      const stats = await paymentService.getStats();
      return ApiResponseHelper.success(
        res,
        stats,
        "Payment stats retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async settleCod(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      const parsed = AdminSettleCodDTO.safeParse(req.body ?? {});
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const payment = await paymentService.adminSettleCod(
        req.user.id,
        req.params.id as string,
      );
      return ApiResponseHelper.success(
        res,
        payment,
        "COD payment settled successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async refund(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      const parsed = AdminRefundDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }
      const payment = await paymentService.adminRefund(
        req.user.id,
        parsed.data.shipmentId,
        parsed.data.amount,
        parsed.data.reason,
      );
      return ApiResponseHelper.success(
        res,
        payment,
        "Refund recorded successfully",
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
}
