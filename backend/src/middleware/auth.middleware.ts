import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import { HttpException } from "../exceptions/http-exception";
import { UserModel } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpException(401, "Unauthorized - No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new HttpException(401, "Unauthorized - Invalid token format");
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY) as {
        id: string;
        email: string;
        role: string;
      };

      const currentUser = await UserModel.findById(decoded.id).select(
        "_id email role status",
      );
      if (!currentUser) {
        throw new HttpException(401, "Unauthorized - Account not found");
      }
      if (currentUser.status === "inactive") {
        throw new HttpException(403, "Forbidden - Account is inactive");
      }

      req.user = {
        id: currentUser._id.toString(),
        email: currentUser.email,
        role: currentUser.role,
      };
      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(401, "Unauthorized - Invalid or expired token");
    }
  } catch (error: any) {
    return res.status(error.status || 401).json({
      success: false,
      message: error.message || "Unauthorized",
      status: error.status || 401,
    });
  }
};

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new HttpException(401, "Unauthorized - Please login first");
    }

    if (req.user.role !== "admin") {
      throw new HttpException(403, "Forbidden - Admin access required");
    }

    next();
  } catch (error: any) {
    return res.status(error.status || 403).json({
      success: false,
      message: error.message || "Forbidden",
      status: error.status || 403,
    });
  }
};

export const driverMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new HttpException(401, "Unauthorized - Please login first");
    }

    if (req.user.role !== "driver") {
      throw new HttpException(403, "Forbidden - Driver access required");
    }

    next();
  } catch (error: any) {
    return res.status(error.status || 403).json({
      success: false,
      message: error.message || "Forbidden",
      status: error.status || 403,
    });
  }
};
