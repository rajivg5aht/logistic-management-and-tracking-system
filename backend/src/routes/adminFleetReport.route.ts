import { Router } from "express";
import { AdminFleetReportController } from "../controllers/adminFleetReport.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";

const adminFleetReportRouter = Router();
const controller = new AdminFleetReportController();

adminFleetReportRouter.use(authMiddleware);
adminFleetReportRouter.use(adminMiddleware);

adminFleetReportRouter.get("/stats", controller.getStats);
adminFleetReportRouter.get("/incidents", controller.getIncidents);
adminFleetReportRouter.patch("/incidents/:id", controller.updateIncidentStatus);
adminFleetReportRouter.get("/fuel-expenses", controller.getFuelExpenses);
adminFleetReportRouter.patch(
  "/fuel-expenses/:id",
  controller.updateFuelExpenseStatus,
);

export default adminFleetReportRouter;
