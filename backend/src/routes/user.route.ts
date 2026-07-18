import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../configs/multer.config";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);

userRouter.get("/whoami", authMiddleware, userController.whoami);
userRouter.put(
  "/change-password",
  authMiddleware,
  adminMiddleware,
  userController.changePassword,
);
userRouter.put(
  "/update",
  authMiddleware,
  upload.single("profileImage"),
  userController.updateUser,
);

export default userRouter;
