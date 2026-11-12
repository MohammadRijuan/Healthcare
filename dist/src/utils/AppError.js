"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(statusCode, message, stack = "") {
        super(message); // throw new Error(message)
        this.statusCode = statusCode;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
//throw new AppError(404, "Not Found")
//# sourceMappingURL=AppError.js.map