import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";

export function notFoundMiddleware(_req: Request, res: Response): Response {
  return ApiResponseHelper.error(res, "API route not found", 404);
}

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction): Response {
  if (res.headersSent) return res;

  if (error instanceof HttpException) {
    return ApiResponseHelper.error(res, error.message, error.status);
  }

  if (error instanceof z.ZodError) {
    return ApiResponseHelper.error(res, z.prettifyError(error), 400);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return ApiResponseHelper.error(res, "A record with this value already exists", 409);
  }

  if (error instanceof Error && error.name === "ValidationError") {
    return ApiResponseHelper.error(res, error.message, 400);
  }

  console.error("Unhandled API error", error);
  return ApiResponseHelper.error(res, "Internal server error", 500);
}
