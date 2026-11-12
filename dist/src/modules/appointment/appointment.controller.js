"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const appointment_service_1 = require("./appointment.service");
const bookAppointment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const user = req.user;
    const result = await appointment_service_1.appointmentServices.bookAppointment(payload, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});
const payAppointment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const user = req.user;
    const result = await appointment_service_1.appointmentServices.payAppointment(payload, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Appointment Payment Initiated Successfully",
        data: result,
    });
});
const bookAppointmentCallback = (0, catchAsync_1.catchAsync)(async (req, res) => {
    console.log(req.query, "req.query");
    const { executedPaymentResult, redirectUrl } = await appointment_service_1.appointmentServices.bookAppointmentCallback(req.query);
    console.log({ executedPaymentResult }, "callback controller");
    res.redirect(redirectUrl);
    // sendResponse(res, {
    //     statusCode: httpStatus.OK,
    //     success: true,
    //     message: "User profile fetched successfully",
    //     data: result,
    // });
});
const cancelAppointment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await appointment_service_1.appointmentServices.cancelAppointment(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Appointment Cancelled And Refunded Successfully",
        data: result,
    });
});
exports.appointmentControllers = {
    bookAppointment,
    bookAppointmentCallback,
    payAppointment,
    cancelAppointment
};
//# sourceMappingURL=appointment.controller.js.map