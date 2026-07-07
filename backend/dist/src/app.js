"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const adminDriver_route_1 = __importDefault(require("./routes/adminDriver.route"));
const driver_route_1 = __importDefault(require("./routes/driver.route"));
const shipment_route_1 = __importDefault(require("./routes/shipment.route"));
const adminShipment_route_1 = __importDefault(require("./routes/adminShipment.route"));
const inquiry_route_1 = __importDefault(require("./routes/inquiry.route"));
const adminInquiry_route_1 = __importDefault(require("./routes/adminInquiry.route"));
const adminVehicle_route_1 = __importDefault(require("./routes/adminVehicle.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4000",
        "http://127.0.0.1:4000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logistics Management API is running",
    });
});
app.use("/api/v1/auth", user_route_1.default);
app.use("/api/v1/admin/users", admin_route_1.default);
app.use("/api/v1/admin/drivers", adminDriver_route_1.default);
app.use("/api/v1/admin/vehicles", adminVehicle_route_1.default);
app.use("/api/v1/driver", driver_route_1.default);
app.use("/api/v1/shipments", shipment_route_1.default);
app.use("/api/v1/admin/shipments", adminShipment_route_1.default);
app.use("/api/v1/inquiries", inquiry_route_1.default);
app.use("/api/v1/admin/inquiries", adminInquiry_route_1.default);
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "API route not found",
    });
});
app.use((err, req, res, next) => {
    console.error("Error:", err);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});
exports.default = app;
