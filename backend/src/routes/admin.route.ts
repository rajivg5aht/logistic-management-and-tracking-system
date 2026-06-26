import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";

const adminRouter = Router();
const adminController = new AdminController();

// Protect all routes under this router
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.get("/", adminController.getUsers);
adminRouter.get("/:id", adminController.getUserById);
adminRouter.post("/", adminController.createUser);
adminRouter.put("/:id", adminController.updateUser);
adminRouter.patch("/:id", adminController.updateUser);
adminRouter.delete("/:id", adminController.deleteUser);

export default adminRouter;
