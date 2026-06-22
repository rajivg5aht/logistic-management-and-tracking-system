"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const user_route_1 = __importDefault(require("./routes/user.route"));
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
