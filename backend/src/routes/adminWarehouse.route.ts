import { Router } from "express";
import { AdminWarehouseController } from "../controllers/adminWarehouse.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";

const adminWarehouseRouter = Router();
const controller = new AdminWarehouseController();

adminWarehouseRouter.use(authMiddleware);
adminWarehouseRouter.use(adminMiddleware);

adminWarehouseRouter.get("/", controller.getWarehouses);
adminWarehouseRouter.get("/stats", controller.getStats);
adminWarehouseRouter.get("/options", controller.getOptions);
adminWarehouseRouter.get("/:id", controller.getWarehouseById);
adminWarehouseRouter.post("/", controller.createWarehouse);
adminWarehouseRouter.put("/:id", controller.updateWarehouse);
adminWarehouseRouter.patch("/:id", controller.updateWarehouse);
adminWarehouseRouter.delete("/:id", controller.deactivateWarehouse);

export default adminWarehouseRouter;
