import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import adminDriverRoutes from "./routes/adminDriver.route";
import driverRoutes from "./routes/driver.route";
import shipmentRoutes from "./routes/shipment.route";
import publicTrackingRoutes from "./routes/publicTracking.route";
import adminShipmentRoutes from "./routes/adminShipment.route";
import inquiryRoutes from "./routes/inquiry.route";
import adminInquiryRoutes from "./routes/adminInquiry.route";
import announcementRoutes from "./routes/announcement.route";
import adminAnnouncementRoutes from "./routes/adminAnnouncement.route";
import assistantRoutes from "./routes/assistant.route";
import adminVehicleRoutes from "./routes/adminVehicle.route";
import adminFleetReportRoutes from "./routes/adminFleetReport.route";
import paymentRoutes from "./routes/payment.route";
import { apiResponseMiddleware } from "./middleware/api-response.middleware";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import adminPaymentRoutes from "./routes/adminPayment.route";
import { CORS_ORIGINS } from "./configs/constant";

const app: Application = express();

app.use(
  cors({
    origin: CORS_ORIGINS,
    allowedHeaders: ["Authorization", "Content-Type", "If-None-Match", "X-Request-Id"],
    exposedHeaders: ["ETag", "Link", "X-Request-Id", "Location"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiResponseMiddleware);
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
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin/payments", adminPaymentRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/track", publicTrackingRoutes);
app.use("/api/v1/admin/shipments", adminShipmentRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/admin/inquiries", adminInquiryRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/admin/announcements", adminAnnouncementRoutes);
app.use("/api/v1/assistant", assistantRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
