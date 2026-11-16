import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { analyticsServices } from "./analytics.service";

const getPatientAnalytics = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const result = await analyticsServices.getPatientAnalyticsService(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient Analytics Retrieved Successfully",
        data: result,
    });
});

const getDoctorAnalytics = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const result = await analyticsServices.getDoctorAnalyticsService(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor Analytics Retrieved Successfully",
        data: result,
    });
});

const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsServices.getAdminAnalyticsService();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin Analytics Retrieved Successfully",
        data: result,
    });
});

export const analyticsControllers = {
    getPatientAnalytics,
    getDoctorAnalytics,
    getAdminAnalytics,
};