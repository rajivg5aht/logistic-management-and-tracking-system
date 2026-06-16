import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import { ApiResponseHelper } from "../uttils/apihelper.util";
import { AuthRequest } from "../middleware/auth.middleware";

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const userData = CreateUserDTO.safeParse(req.body);

      if (!userData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(userData.error),
          400,
        );
      }

      const user = await userService.createUser(userData.data);

      return ApiResponseHelper.success(
        res,
        user,
        "User created successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsedData.error),
          400,
        );
      }

      const { user, token } = await userService.loginUser(parsedData.data);

      return ApiResponseHelper.success(
        res,
        { user, token },
        "Login successful",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async whoami(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const user = await userService.getUserById(req.user.id);

      return ApiResponseHelper.success(res, user, "User retrieved successfully");
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const updateData: any = { ...req.body };

      // If file was uploaded, add the file path
      if (req.file) {
        updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
      }

      const parsedData = UpdateUserDTO.safeParse(updateData);

      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsedData.error),
          400,
        );
      }

      const updatedUser = await userService.updateUser(
        req.user.id,
        parsedData.data,
      );

      return ApiResponseHelper.success(
        res,
        updatedUser,
        "User updated successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }
}
