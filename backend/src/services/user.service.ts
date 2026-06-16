import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export type SafeUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: IUser["role"];
};

export class UserService {
  private sanitizeUser(user: IUser): SafeUser {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
  }

 async createUser(userData: CreateUserDTO): Promise<SafeUser> {
  try {
    console.log("========== REGISTER START ==========");
    console.log("Incoming Data:", userData);

    console.log("STEP 1: Checking existing email");

    const existingEmail = await userRepository.getUserByEmail(
      userData.email,
    );

    console.log("STEP 2: Email check completed");

    if (existingEmail) {
      console.log("STEP 2A: Email already exists");

      throw new HttpException(
        400,
        "Email already exists",
      );
    }

    console.log("STEP 3: Hashing password");

    const hashedPassword = await bcryptjs.hash(
      userData.password,
      10,
    );

    console.log("STEP 4: Password hashed");

    console.log("STEP 5: Creating user in database");

    const user = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    console.log("STEP 6: User created successfully");
    console.log("User ID:", user._id);

    console.log("========== REGISTER END ==========");

    return this.sanitizeUser(user);
  } catch (error: any) {
    console.error("========== REGISTER ERROR ==========");
    console.error(error);
    console.error("===================================");

    throw error;
  }
 }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);

    if (!user) {
      throw new HttpException(401, "Invalid email or password");
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      SECRET_KEY,
      {
        expiresIn: "30d",
      },
    );

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }
}