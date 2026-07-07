"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipment_controller_1 = require("../controllers/shipment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const adminShipmentRouter = (0, express_1.Router)();
const shipmentController = new shipment_controller_1.ShipmentController();
// Protect all routes under this router
adminShipmentRouter.use(auth_middleware_1.authMiddleware);
adminShipmentRouter.use(auth_middleware_1.adminMiddleware);
adminShipmentRouter.get("/", shipmentController.adminGetShipments);
adminShipmentRouter.get("/stats", shipmentController.adminGetStats);
adminShipmentRouter.get("/:id", shipmentController.adminGetShipmentById);
adminShipmentRouter.put("/:id", shipmentController.adminUpdateShipment);
adminShipmentRouter.patch("/:id", shipmentController.adminUpdateShipment);
adminShipmentRouter.delete("/:id", shipmentController.adminDeleteShipment);
exports.default = adminShipmentRouter;
