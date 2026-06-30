import bcryptjs from "bcryptjs";
import { connectToMongoDB, disconnectFromMongoDB } from "./mongodb";
import { UserModel } from "../models/user.model";

async function seedAdmin() {
  try {
    await connectToMongoDB();
    console.log("Connected to MongoDB for seeding...");

    const adminEmail = "admin@example.com";
    const adminExists = await UserModel.findOne({ email: adminEmail });

    if (adminExists) {
      // Check if password is already hashed (bcrypt hashes start with "$2a$" or "$2b$")
      if (
        !adminExists.password.startsWith("$2a$") &&
        !adminExists.password.startsWith("$2b$")
      ) {
        console.log("Admin found with plain-text password. Hashing it now...");
        const hashed = await bcryptjs.hash(adminExists.password, 10);
        await UserModel.updateOne(
          { email: adminEmail },
          { $set: { password: hashed, role: "admin" } },
        );
        console.log("Admin password has been hashed successfully.");
      } else {
        console.log("Admin already exists with a hashed password. Skipping.");
      }
    } else {
      console.log("No admin found. Creating default admin user...");
      const hashedPassword = await bcryptjs.hash("Admin@123", 10);

      await UserModel.create({
        fullName: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        phoneNumber: "0000000000",
        status: "active",
      });

      console.log("Default admin user created successfully.");
      console.log("  Email:    admin@example.com");
      console.log("  Password: Admin@123");
    }

    await disconnectFromMongoDB();
    console.log("Seeding complete. Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedAdmin();
