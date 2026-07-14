import { Router } from "express";
import { DriverController } from "../controllers/driver.controller";
import { authMiddleware, driverMiddleware } from "../middleware/auth.middleware";
import { fuelReceiptUpload, proofUpload } from "../configs/multer.config";

const driverRouter = Router();
const driverController = new DriverController();

driverRouter.use(authMiddleware);
driverRouter.use(driverMiddleware);

driverRouter.get("/me", driverController.getMe);
driverRouter.get("/stats", driverController.getStats);
driverRouter.patch("/availability", driverController.updateAvailability);
driverRouter.get("/fleet", driverController.getFleet);
driverRouter.post("/fleet/incidents", driverController.reportFleetIncident);
driverRouter.patch("/fleet/incidents/:id", driverController.updateFleetIncident);
driverRouter.delete("/fleet/incidents/:id", driverController.deleteFleetIncident);
driverRouter.post(
  "/fleet/fuel-expenses",
  fuelReceiptUpload.single("receipt"),
  driverController.logFuelExpense,
);
driverRouter.patch(
  "/fleet/fuel-expenses/:id",
  fuelReceiptUpload.single("receipt"),
  driverController.updateFuelExpense,
);
driverRouter.delete(
  "/fleet/fuel-expenses/:id",
  driverController.deleteFuelExpense,
);
driverRouter.get("/shipments", driverController.getMyAssignments);
driverRouter.get("/shipments/:id", driverController.getAssignmentById);
driverRouter.patch("/shipments/:id/stage", driverController.updateStage);
driverRouter.patch(
  "/shipments/:id/proof",
  proofUpload.fields([
    { name: "proofPhoto", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  driverController.upsertProof,
);
driverRouter.delete("/shipments/:id/proof", driverController.deleteProof);
driverRouter.patch("/shipments/:id/cod", driverController.collectCod);

export default driverRouter;
