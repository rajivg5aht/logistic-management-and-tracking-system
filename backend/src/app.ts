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
import adminWarehouseRoutes from "./routes/adminWarehouse.route";

const app: Application = express();


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4000",
      "http://127.0.0.1:4000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),   
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Logistics Management API is running",
  });
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin/users", adminRoutes);
app.use("/api/v1/admin/drivers", adminDriverRoutes);
app.use("/api/v1/admin/vehicles", adminVehicleRoutes);
app.use("/api/v1/admin/warehouses", adminWarehouseRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/admin/shipments", adminShipmentRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/admin/inquiries", adminInquiryRoutes);

app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
