import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import adminDriverRoutes from "./routes/adminDriver.route";
import driverRoutes from "./routes/driver.route";
import shipmentRoutes from "./routes/shipment.route";
import adminShipmentRoutes from "./routes/adminShipment.route";
import inquiryRoutes from "./routes/inquiry.route";
import adminInquiryRoutes from "./routes/adminInquiry.route";
import adminVehicleRoutes from "./routes/adminVehicle.route";
import adminFleetReportRoutes from "./routes/adminFleetReport.route";
import { CORS_ORIGINS } from "./configs/constant";

const app: Application = express();

app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Logistics Management API is running",
  });
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin/users", adminRoutes);
app.use("/api/v1/admin/drivers", adminDriverRoutes);
app.use("/api/v1/admin/vehicles", adminVehicleRoutes);
app.use("/api/v1/admin/fleet-reports", adminFleetReportRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/admin/shipments", adminShipmentRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/admin/inquiries", adminInquiryRoutes);

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
