import { Router } from "express";
import { ShipmentController } from "../controllers/shipment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const shipmentRouter = Router();
const shipmentController = new ShipmentController();

// Customer routes (must be authenticated)
shipmentRouter.use(authMiddleware);

shipmentRouter.post("/", shipmentController.createShipment);
shipmentRouter.get("/my", shipmentController.getMyShipments);
shipmentRouter.patch("/:id", shipmentController.customerUpdateShipment);
shipmentRouter.patch("/:id/cancel", shipmentController.customerCancelShipment);
shipmentRouter.delete("/:id", shipmentController.customerDeleteShipment);

export default shipmentRouter;
