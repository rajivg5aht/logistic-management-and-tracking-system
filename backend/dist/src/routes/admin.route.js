"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const adminRouter = (0, express_1.Router)();
const adminController = new admin_controller_1.AdminController();
// Protect all routes under this router
adminRouter.use(auth_middleware_1.authMiddleware);
adminRouter.use(auth_middleware_1.adminMiddleware);
adminRouter.get("/", adminController.getUsers);
adminRouter.get("/:id", adminController.getUserById);
adminRouter.post("/", adminController.createUser);
adminRouter.put("/:id", adminController.updateUser);
adminRouter.patch("/:id", adminController.updateUser);
adminRouter.delete("/:id", adminController.deleteUser);
exports.default = adminRouter;
