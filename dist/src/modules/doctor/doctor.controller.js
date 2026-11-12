"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const doctor_validation_1 = require("./doctor.validation");
const doctor_service_1 = require("./doctor.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const applyAsDoctor = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const files = req.files;
    console.log({ files });
    const resume = files?.["resume"]?.[0] ?? null;
    const additionalFiles = files?.["additionalFiles"] || [];
    const zodValidationResult = doctor_validation_1.ApplyAsDoctorValidationZodSchema.safeParse(JSON.parse(req.body.data));
    if (!zodValidationResult.success) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, zodValidationResult.error.issues[0]?.message ?? "Invalid doctor application data");
    }
    // const payload = zodValidationResult.data;
    const { address, bio, consultationFee, contactNumber, ...doctor } = zodValidationResult.data.doctor;
    const payload = {
        ...zodValidationResult.data,
        doctor: {
            ...doctor,
            ...(address !== undefined ? { address } : {}),
            ...(bio !== undefined ? { bio } : {}),
            ...(consultationFee !== undefined ? { consultationFee } : {}),
            ...(contactNumber !== undefined ? { contactNumber } : {}),
        },
    };
    const result = await doctor_service_1.doctorServices.applyAsDoctor(payload, resume, additionalFiles);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Applied As Doctor Successfuly",
        data: result,
    });
});
const verifyDoctorEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await doctor_service_1.doctorServices.verifyDoctorEmailService(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Doctor Email Verified Successfully",
        data: result,
    });
});
const approveDoctor = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const user = req.user;
    const result = await doctor_service_1.doctorServices.approveDoctorService(payload, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Doctor Email Verified Successfully",
        data: result,
    });
});
const getAllDoctors = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { data, meta } = await doctor_service_1.doctorServices.getAllDoctorsService(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Doctors Retrieved Successfully",
        data: data,
        meta: meta,
    });
});
exports.doctorControllers = {
    applyAsDoctor,
    verifyDoctorEmail,
    approveDoctor,
    getAllDoctors
};
//# sourceMappingURL=doctor.controller.js.map