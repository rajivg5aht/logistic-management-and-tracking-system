"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driver_controller_1 = require("../controllers/driver.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const driverRouter = (0, express_1.Router)();
const driverController = new driver_controller_1.DriverController();
// Protect all routes: authenticated drivers only.
driverRouter.use(auth_middleware_1.authMiddleware);
driverRouter.use(auth_middleware_1.driverMiddleware);
driverRouter.get("/stats", driverController.getStats);
driverRouter.patch("/availability", driverController.updateAvailability);
driverRouter.get("/shipments", driverController.getMyAssignments);
driverRouter.get("/shipments/:id", driverController.getAssignmentById);
driverRouter.patch("/shipments/:id/stage", driverController.updateStage);
exports.default = driverRouter;
