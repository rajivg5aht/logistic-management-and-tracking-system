import mongoose from "mongoose";
import { Response } from "express";
import { ApiResponseHelper } from "./apihelper.util";

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

export type SortDirection = "asc" | "desc";

export type CollectionQuery<TSortField extends string> = {
  page: number;
  limit: number;
  search: string;
  sort: {
    field: TSortField;
    direction: SortDirection;
  };
};

type PaginationOptions = {
  defaultLimit?: number;
  maxLimit?: number;
};

export function parsePagination(query: {
  page?: unknown;
  limit?: unknown;
}, options: PaginationOptions = {}): { page: number; limit: number } {
  const page = Number.parseInt(String(query.page ?? "1"), 10);
  const requestedLimit = Number.parseInt(
    String(query.limit ?? options.defaultLimit ?? DEFAULT_PAGE_LIMIT),
    10,
  );
  const defaultLimit = options.defaultLimit ?? DEFAULT_PAGE_LIMIT;
  const maxLimit = options.maxLimit ?? MAX_PAGE_LIMIT;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit:
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, maxLimit)
        : defaultLimit,
  };
}

/**
 * Parses collection query parameters consistently. The sort field is always
 * validated against an endpoint-owned allowlist before it reaches a repository.
 */
export function parseCollectionQuery<TSortField extends string>(
  query: { page?: unknown; limit?: unknown; search?: unknown; sort?: unknown },
  options: {
    allowedSortFields: readonly TSortField[];
    defaultSortField: TSortField;
    defaultDirection?: SortDirection;
  } & PaginationOptions,
): CollectionQuery<TSortField> {
  const { page, limit } = parsePagination(query, options);
  const rawSort = String(query.sort ?? "").trim();
  const requestedField = rawSort.replace(/^-/, "") as TSortField;
  const field = options.allowedSortFields.includes(requestedField)
    ? requestedField
    : options.defaultSortField;

  return {
    page,
    limit,
    search: String(query.search ?? "").trim(),
    sort: {
      field,
      direction:
        rawSort.startsWith("-") || rawSort.toLowerCase() === "desc"
          ? "desc"
          : options.defaultDirection ?? "asc",
    },
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
