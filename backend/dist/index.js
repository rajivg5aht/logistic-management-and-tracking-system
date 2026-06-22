"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const constant_1 = require("./src/configs/constant");
const mongodb_1 = require("./src/database/mongodb");
const startServer = async () => {
    try {
        await (0, mongodb_1.connectToMongoDB)();
        app_1.default.listen(constant_1.PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${constant_1.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
    }
};
startServer();
