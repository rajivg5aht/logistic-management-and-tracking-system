import { Router } from "express";
import { AdminDriverController } from "../controllers/adminDriver.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";

const adminDriverRouter = Router();
const adminDriverController = new AdminDriverController();

// Protect all routes: authenticated admins only.
adminDriverRouter.use(authMiddleware);
adminDriverRouter.use(adminMiddleware);

adminDriverRouter.get("/", adminDriverController.getDrivers);
adminDriverRouter.get("/:id", adminDriverController.getDriverById);
adminDriverRouter.post("/", adminDriverController.createDriver);
adminDriverRouter.put("/:id", adminDriverController.updateDriver);
adminDriverRouter.patch("/:id", adminDriverController.updateDriver);
adminDriverRouter.delete("/:id", adminDriverController.deleteDriver);

export default adminDriverRouter;
