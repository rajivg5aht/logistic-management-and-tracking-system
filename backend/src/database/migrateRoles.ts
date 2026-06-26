import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";
import { UserModel } from "../models/user.model";

async function migrateRoles() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB for role migration...");

    // Update all users where role is "user" to "customer"
    const result = await UserModel.updateMany(
      { role: "user" },
      { $set: { role: "customer" } }
    );

    console.log(`Migration complete. Matched and updated ${result.modifiedCount} users from 'user' to 'customer'.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateRoles();
