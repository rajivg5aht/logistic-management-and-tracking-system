"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("./mongodb");
const user_model_1 = require("../models/user.model");
async function migrateRoles() {
    try {
        await (0, mongodb_1.connectToMongoDB)();
        console.log("Connected to MongoDB for role migration...");
        // Update all users where role is "user" to "customer"
        const result = await user_model_1.UserModel.updateMany({ role: "user" }, { $set: { role: "customer" } });
        console.log(`Migration complete. Matched and updated ${result.modifiedCount} users from 'user' to 'customer'.`);
        await (0, mongodb_1.disconnectFromMongoDB)();
        process.exit(0);
    }
    catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}
migrateRoles();
