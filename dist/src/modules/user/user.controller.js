"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const user_service_1 = require("./user.service");
const sendResponse_1 = require("../../utils/sendResponse");
const AppError_1 = require("../../utils/AppError");
const http_status_1 = __importDefault(require("http-status"));
const uploadProfileImage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.file) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "No File Provided.");
    }
    const userId = req.user?.userId;
    const result = await user_service_1.userServices.uploadProfileImageService(req.file?.buffer, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "New tokens generated successfully",
        data: result,
    });
});
exports.userController = {
    uploadProfileImage
};
//# sourceMappingURL=user.controller.js.map