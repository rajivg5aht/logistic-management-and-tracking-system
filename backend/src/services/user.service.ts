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
    // Check existing email
    const existingEmail = await userRepository.getUserByEmail(userData.email);

    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(userData.password, 10);

    const user = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    return this.sanitizeUser(user);
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