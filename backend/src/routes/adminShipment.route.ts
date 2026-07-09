import { Router } from "express";
import { ShipmentController } from "../controllers/shipment.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";

const adminShipmentRouter = Router();
const shipmentController = new ShipmentController();

// Protect all routes under this router
adminShipmentRouter.use(authMiddleware);
adminShipmentRouter.use(adminMiddleware);

adminShipmentRouter.get("/", shipmentController.adminGetShipments);
adminShipmentRouter.get("/stats", shipmentController.adminGetStats);
adminShipmentRouter.get("/analytics", shipmentController.adminGetAnalytics);
adminShipmentRouter.get("/:id", shipmentController.adminGetShipmentById);
adminShipmentRouter.put("/:id", shipmentController.adminUpdateShipment);
adminShipmentRouter.patch("/:id", shipmentController.adminUpdateShipment);
adminShipmentRouter.delete("/:id", shipmentController.adminDeleteShipment);

export default adminShipmentRouter;
