"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const config_1 = __importDefault(require("../config"));
const prisma_1 = require("../lib/prisma");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = require("../utils/AppError");
const catchAsync_1 = require("../utils/catchAsync");
const jwt_1 = require("../utils/jwt");
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        const token = req.cookies.accessToken
            ? req.cookies.accessToken
            : req.headers.authorization?.startsWith("Bearer")
                ? req.headers.authorization?.split(" ")[1]
                : req.headers.authorization;
        if (!token) {
            throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "You are not logged in... please login to access this resource");
        }
        const verifiedToken = jwt_1.jwtUtils.verifyToken(token, config_1.default.jwt_access_secret);
        if (!verifiedToken.success) {
            throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, verifiedToken.error);
        }
        const { email, name, userId, role } = verifiedToken.data;
        if (requiredRoles.length && !requiredRoles.includes(role)) {
            throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "Forbidden. You don't have permission to access this resource.");
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                id: userId,
                email,
                name,
                role,
            },
        });
        if (!user) {
            throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "User not found. Please log in again.");
        }
        if (user.status === "BLOCKED") {
            throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "Your account has been blocked. Please contact support.");
        }
        req.user = {
            email,
            name,
            userId,
            role,
        };
        next();
    });
};
exports.auth = auth;
//# sourceMappingURL=checkAuth.js.map