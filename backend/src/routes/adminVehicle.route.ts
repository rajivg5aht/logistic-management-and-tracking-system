import { Router } from "express";
import { AdminVehicleController } from "../controllers/adminVehicle.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";
import { vehicleUpload } from "../configs/multer.config";

const adminVehicleRouter = Router();
const controller = new AdminVehicleController();

adminVehicleRouter.use(authMiddleware);
adminVehicleRouter.use(adminMiddleware);

adminVehicleRouter.get("/", controller.getVehicles);
adminVehicleRouter.get("/stats", controller.getStats);
adminVehicleRouter.get("/:id", controller.getVehicleById);
adminVehicleRouter.post("/", controller.createVehicle);
adminVehicleRouter.post(
  "/:id/image",
  vehicleUpload.single("image"),
  controller.uploadVehicleImage,
);
adminVehicleRouter.put("/:id", controller.updateVehicle);
adminVehicleRouter.patch("/:id", controller.updateVehicle);
adminVehicleRouter.patch("/:id/assignment", controller.assignDriver);
adminVehicleRouter.delete("/:id/permanent", controller.removeVehicle);
adminVehicleRouter.delete("/:id", controller.deactivateVehicle);

export default adminVehicleRouter;
