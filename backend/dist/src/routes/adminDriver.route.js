"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminDriver_controller_1 = require("../controllers/adminDriver.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const adminDriverRouter = (0, express_1.Router)();
const adminDriverController = new adminDriver_controller_1.AdminDriverController();
// Protect all routes: authenticated admins only.
adminDriverRouter.use(auth_middleware_1.authMiddleware);
adminDriverRouter.use(auth_middleware_1.adminMiddleware);
adminDriverRouter.get("/", adminDriverController.getDrivers);
adminDriverRouter.get("/:id", adminDriverController.getDriverById);
adminDriverRouter.post("/", adminDriverController.createDriver);
adminDriverRouter.put("/:id", adminDriverController.updateDriver);
adminDriverRouter.patch("/:id", adminDriverController.updateDriver);
adminDriverRouter.delete("/:id", adminDriverController.deleteDriver);
exports.default = adminDriverRouter;
