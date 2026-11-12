"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const validateRequest = (zodSchema) => {
    return (0, catchAsync_1.catchAsync)((req, res, next) => {
        const payload = req.body ?? {};
        const result = zodSchema.safeParse(payload);
        if (!result.success) {
            console.log(result.error);
            console.log(result.error.issues);
            throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, result.error.issues[0]?.message ?? "Request validation failed");
        }
        req.body = result.data;
        next();
    });
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map