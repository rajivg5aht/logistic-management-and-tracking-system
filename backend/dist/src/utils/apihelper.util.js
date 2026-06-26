"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseHelper = void 0;
class ApiResponseHelper {
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
