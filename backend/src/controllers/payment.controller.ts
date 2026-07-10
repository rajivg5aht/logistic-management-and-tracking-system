import { Response } from "express";
import { PaymentService } from "../services/payment.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";

const paymentService = new PaymentService();

export class PaymentController {
  // Customer: my payment history
  async getMine(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      const payments = await paymentService.getMyPayments(req.user.id);
      return ApiResponseHelper.success(
        res,
        payments,
        "Payments retrieved successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  // Customer: payments for one of my shipments
  async getByShipment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      const payments = await paymentService.getByShipment(
        req.params.id as string,
      );
      return ApiResponseHelper.success(
        res,
        payments,
        "Payments retrieved successfully",
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
