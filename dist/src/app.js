"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const notFound_1 = require("./middlewares/notFound");
const auth_route_1 = require("./modules/auth/auth.route");
const user_route_1 = require("./modules/user/user.route");
const bkash_1 = require("./lib/bkash");
const http_status_1 = __importDefault(require("http-status"));
const appointment_route_1 = require("./modules/appointment/appointment.route");
const doctor_route_1 = require("./modules/doctor/doctor.route");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.default.app_url,
    credentials: true,
}));
// middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// all api
app.use("/api/v1/auth", auth_route_1.authRoutes);
app.use("/api/v1/user", user_route_1.userRoutes);
app.use("/api/v1/appointment", appointment_route_1.appointementRoutes);
app.use("/api/v1/doctor", doctor_route_1.doctorRoutes);
// testing
app.get("/test", async (req, res, next) => {
    try {
        const grantIdTokenResult = await (0, bkash_1.getBkashIdToken)();
        console.log(grantIdTokenResult);
        res.status(http_status_1.default.OK).json({
            success: true,
            message: "Welcome to PH Healthcare System Backend",
            data: null
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
app.use("/", (req, res) => {
    res.json({
        success: true,
        message: "Congratulations ... Healthcare backend server is now live",
    });
});
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.notFound);
exports.default = app;
//# sourceMappingURL=app.js.map