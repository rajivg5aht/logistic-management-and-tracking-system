import { Router } from "express";
import { AdminVehicleController } from "../controllers/adminVehicle.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";

const adminVehicleRouter = Router();
const controller = new AdminVehicleController();

adminVehicleRouter.use(authMiddleware);
adminVehicleRouter.use(adminMiddleware);

adminVehicleRouter.get("/", controller.getVehicles);
adminVehicleRouter.get("/stats", controller.getStats);
adminVehicleRouter.get("/:id", controller.getVehicleById);
adminVehicleRouter.post("/", controller.createVehicle);
adminVehicleRouter.put("/:id", controller.updateVehicle);
adminVehicleRouter.patch("/:id", controller.updateVehicle);
adminVehicleRouter.patch("/:id/assignment", controller.assignDriver);
adminVehicleRouter.delete("/:id", controller.deactivateVehicle);

export default adminVehicleRouter;
