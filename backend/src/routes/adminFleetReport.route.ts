import { Router } from "express";
import { AdminFleetReportController } from "../controllers/adminFleetReport.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";

const adminFleetReportRouter = Router();
const controller = new AdminFleetReportController();

adminFleetReportRouter.use(authMiddleware);
adminFleetReportRouter.use(adminMiddleware);

adminFleetReportRouter.get("/stats", controller.getStats);
adminFleetReportRouter.get("/incidents", controller.getIncidents);
adminFleetReportRouter.patch("/incidents/:id", controller.updateIncident);
adminFleetReportRouter.post(
  "/incidents/:id/work-orders",
  controller.createWorkOrder,
);
adminFleetReportRouter.get("/work-orders", controller.getWorkOrders);
adminFleetReportRouter.patch("/work-orders/:id", controller.updateWorkOrder);
adminFleetReportRouter.get("/fuel-expenses", controller.getFuelExpenses);
adminFleetReportRouter.patch(
  "/fuel-expenses/:id",
  controller.updateFuelExpense,
);

export default adminFleetReportRouter;