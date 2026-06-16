"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseHelper = void 0;
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
class ApiResponseHelper {
    // consistent way ma response gardai janu
    static success(res, data, message = "Success", status = 200, meta) {
        const response = {
            status,
            success: true,
            message,
            data,
            meta,
        };
        return res.status(status).json(response);
    }
    static error(res, message = "Error", status = 500) {
        const response = {
            status,
            success: false,
            message,
            data: null,
        };
        return res.status(status).json(response);
    }
}
exports.ApiResponseHelper = ApiResponseHelper;
