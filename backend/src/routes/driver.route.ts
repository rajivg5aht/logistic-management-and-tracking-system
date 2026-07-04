import { Router } from "express";
import { DriverController } from "../controllers/driver.controller";
import { authMiddleware, driverMiddleware } from "../middleware/auth.middleware";

const driverRouter = Router();
const driverController = new DriverController();

// Protect all routes: authenticated drivers only.
driverRouter.use(authMiddleware);
driverRouter.use(driverMiddleware);

driverRouter.get("/stats", driverController.getStats);
driverRouter.patch("/availability", driverController.updateAvailability);
driverRouter.get("/shipments", driverController.getMyAssignments);
driverRouter.get("/shipments/:id", driverController.getAssignmentById);
driverRouter.patch("/shipments/:id/stage", driverController.updateStage);

export default driverRouter;
