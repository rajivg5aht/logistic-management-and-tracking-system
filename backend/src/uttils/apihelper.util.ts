import { Response } from "express";

// API response example
const responseExample = {
  status: 200,
  success: true,
  message: "Products fetched successfully",
  data: [],
  meta: {
    // pagination
    page: 1,
    limit: 10,
    total: 100,
  },
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta; // optional
}

export class ApiResponseHelper {
  // consistent way ma response gardai janu
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = 200,
    meta?: PaginationMeta,
  ): Response {
    const response: ApiResponse<T> = {
      status,
      success: true,
      message,
      data,
      meta,
    };

    return res.status(status).json(response);
  }

  static error(
    res: Response,
    message: string = "Error",
    status: number = 500,
  ): Response {
    const response: ApiResponse<null> = {
      status,
      success: false,
      message,
      data: null,
    };

    return res.status(status).json(response);
  }
}