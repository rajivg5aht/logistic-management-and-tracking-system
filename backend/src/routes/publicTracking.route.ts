import { Router } from "express";
import { ShipmentController } from "../controllers/shipment.controller";

// Public, unauthenticated track-by-code route. Anyone with a valid tracking
// ID can view that shipment's tracking details without logging in.
const publicTrackingRouter = Router();
const shipmentController = new ShipmentController();

publicTrackingRouter.get("/:trackingId", shipmentController.publicTrackByCode);

export default publicTrackingRouter;
