import mongoose from "mongoose";
import { Response } from "express";
import { ApiResponseHelper } from "./apihelper.util";

export function parsePagination(query: {
  page?: unknown;
  limit?: unknown;
}): { page: number; limit: number } {
  const page = Number.parseInt(String(query.page ?? "1"), 10);
  const limit = Number.parseInt(String(query.limit ?? "10"), 10);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function handleControllerError(res: Response, error: unknown): Response {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;
  const message =
    error instanceof Error ? error.message : "Internal Server Error";

  return ApiResponseHelper.error(res, message, status);
}
