import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import { HttpException } from "../exceptions/http-exception";

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

      req.user = decoded;
      next();
    } catch (error) {
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
