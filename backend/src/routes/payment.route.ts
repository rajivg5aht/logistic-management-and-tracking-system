import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const paymentRouter = Router();
const paymentController = new PaymentController();

paymentRouter.use(authMiddleware);

paymentRouter.get("/mine", paymentController.getMine);
paymentRouter.get("/shipment/:id", paymentController.getByShipment);

export default paymentRouter;
