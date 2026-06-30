import { connectToMongoDB, disconnectFromMongoDB } from "./mongodb";
import { UserModel } from "../models/user.model";

async function migrateRoles() {
  try {
    await connectToMongoDB();
    console.log("Connected to MongoDB for role migration...");

    // Update all users where role is "user" to "customer"
    const result = await UserModel.updateMany(
      { role: "user" as any },
      { $set: { role: "customer" as any } }
    );

    console.log(`Migration complete. Matched and updated ${result.modifiedCount} users from 'user' to 'customer'.`);

    await disconnectFromMongoDB();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateRoles();
