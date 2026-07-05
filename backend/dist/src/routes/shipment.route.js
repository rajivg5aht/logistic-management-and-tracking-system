"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipment_controller_1 = require("../controllers/shipment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const shipmentRouter = (0, express_1.Router)();
const shipmentController = new shipment_controller_1.ShipmentController();
// Customer routes (must be authenticated)
shipmentRouter.use(auth_middleware_1.authMiddleware);
shipmentRouter.post("/", shipmentController.createShipment);
shipmentRouter.get("/my", shipmentController.getMyShipments);
shipmentRouter.patch("/:id", shipmentController.customerUpdateShipment);
shipmentRouter.patch("/:id/cancel", shipmentController.customerCancelShipment);
shipmentRouter.delete("/:id", shipmentController.customerDeleteShipment);
exports.default = shipmentRouter;
