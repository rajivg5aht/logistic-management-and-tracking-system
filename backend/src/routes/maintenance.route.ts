import { Router } from "express";
import { MaintenanceController } from "../controllers/maintenance.controller";
import {
  authMiddleware,
  maintenanceMiddleware,
} from "../middleware/auth.middleware";
import { maintenanceDocumentUpload } from "../configs/multer.config";

const maintenanceRouter = Router();
const controller = new MaintenanceController();

maintenanceRouter.use(authMiddleware);
maintenanceRouter.use(maintenanceMiddleware);

maintenanceRouter.get("/work-orders", controller.getWorkOrders);
maintenanceRouter.patch(
  "/work-orders/:id",
  maintenanceDocumentUpload.single("invoice"),
  controller.updateWorkOrder,
);

export default maintenanceRouter;