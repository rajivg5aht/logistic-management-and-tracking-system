import mongoose from "mongoose";
import { connectToMongoDBTest } from "../database/mongodb";

beforeAll(async () => {
  await connectToMongoDBTest();
});

afterAll(async () => {
  await mongoose.connection.close();
});
