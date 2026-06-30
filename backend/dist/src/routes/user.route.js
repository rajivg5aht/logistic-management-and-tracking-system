"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_config_1 = require("../configs/multer.config");
const userRouter = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Public routes
userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
// Protected routes
userRouter.get("/whoami", auth_middleware_1.authMiddleware, userController.whoami);
userRouter.put("/update", auth_middleware_1.authMiddleware, multer_config_1.upload.single("profileImage"), userController.updateUser);
exports.default = userRouter;
