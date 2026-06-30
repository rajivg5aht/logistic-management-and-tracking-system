import bcryptjs from "bcryptjs";
import { connectToMongoDB, disconnectFromMongoDB } from "./mongodb";
import { UserModel } from "../models/user.model";

async function updateDonUser() {
  try {
    await connectToMongoDB();
    console.log("Connected to MongoDB to update don@gmail.com...");

    const email = "don@gmail.com";
    const hashedPassword = await bcryptjs.hash("123456", 10);

    const user = await UserModel.findOne({ email });

    if (user) {
      console.log(`User found. Old role: ${user.role}. Updating role to 'customer' and setting password to '123456'...`);
      await UserModel.updateOne(
        { email },
        { 
          $set: { 
            role: "customer",
            password: hashedPassword,
            status: "active"
          } 
        }
      );
      console.log("User updated successfully!");
    } else {
      console.log("User don@gmail.com not found in the database. Creating new user...");
      await UserModel.create({
        fullName: "Don Customer",
        email,
        password: hashedPassword,
        role: "customer",
        phoneNumber: "9876543210",
        status: "active",
      });
      console.log("User don@gmail.com created successfully with role 'customer' and password '123456'.");
    }

    await disconnectFromMongoDB();
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}

updateDonUser();
