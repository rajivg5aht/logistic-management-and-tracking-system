import { Router } from "express";
import { AdminPaymentController } from "../controllers/adminPayment.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";

const adminPaymentRouter = Router();
const controller = new AdminPaymentController();

adminPaymentRouter.use(authMiddleware);
adminPaymentRouter.use(adminMiddleware);

adminPaymentRouter.get("/stats", controller.getStats);
adminPaymentRouter.get("/", controller.getPayments);
adminPaymentRouter.post("/refund", controller.refund);
adminPaymentRouter.patch("/:id/settle", controller.settleCod);

export default adminPaymentRouter;
