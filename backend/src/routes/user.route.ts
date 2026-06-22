import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../configs/multer.config";

const userRouter = Router();
const userController = new UserController();

// Public routes
userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);

// Protected routes
userRouter.get("/whoami", authMiddleware, userController.whoami);
userRouter.put(
  "/update",
  authMiddleware,
  upload.single("profileImage"),
  userController.updateUser,
);

export default userRouter;
