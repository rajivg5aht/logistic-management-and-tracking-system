"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = require("./mongodb");
const user_model_1 = require("../models/user.model");
async function updateDonUser() {
    try {
        await (0, mongodb_1.connectToMongoDB)();
        console.log("Connected to MongoDB to update don@gmail.com...");
        const email = "don@gmail.com";
        const hashedPassword = await bcryptjs_1.default.hash("123456", 10);
        const user = await user_model_1.UserModel.findOne({ email });
        if (user) {
            console.log(`User found. Old role: ${user.role}. Updating role to 'customer' and setting password to '123456'...`);
            await user_model_1.UserModel.updateOne({ email }, {
                $set: {
                    role: "customer",
                    password: hashedPassword,
                    status: "active"
                }
            });
            console.log("User updated successfully!");
        }
        else {
            console.log("User don@gmail.com not found in the database. Creating new user...");
            await user_model_1.UserModel.create({
                fullName: "Don Customer",
                email,
                password: hashedPassword,
                role: "customer",
                phoneNumber: "9876543210",
                status: "active",
            });
            console.log("User don@gmail.com created successfully with role 'customer' and password '123456'.");
        }
        await (0, mongodb_1.disconnectFromMongoDB)();
        console.log("Done.");
        process.exit(0);
    }
    catch (error) {
        console.error("Update failed:", error);
        process.exit(1);
    }
}
updateDonUser();
