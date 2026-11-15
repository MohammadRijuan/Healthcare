import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { scheduleServices } from "./schedule.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const createSchedule = catchAsync(async(req:Request,res:Response)=>{
    const payload = req.body;
    const user = req.user!;

    const result = await scheduleServices.createScheduleService(payload, user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Schedule Created Successfully",
        data: result,
    });
})

const getMyScheduleService = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const { data, meta } = await scheduleServices.getMyScheduleService(req.query, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedules Retrieved Successfully",
        data,
        meta,
    });
});


const getScheduleById = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId as string;

    const result = await scheduleServices.getScheduleByIdService(scheduleId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule Retrieved Successfully",
        data: result,
    });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
    const { data, meta } = await scheduleServices.getAllSchedulesService(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedules Retrieved Successfully",
        data,
        meta,
    });
});

const getTodaysSchedules = catchAsync(async (req: Request, res: Response) => {
    const { data, meta } = await scheduleServices.getTodaysScheduleService(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Today's Schedules Retrieved Successfully",
        data,
        meta,
    });
});


const updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId as string;
    const payload = req.body;
    const user = req.user!;

    const result = await scheduleServices.updateScheduleService(
        scheduleId,
        payload,
        user,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule Updated Successfully",
        data: result,
    });
});

const publishSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId as string;
    const user = req.user!;

    const result = await scheduleServices.publishScheduleService(scheduleId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule Published Successfully",
        data: result,
    });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId as string;
    const user = req.user!;

    const result = await scheduleServices.deleteScheduleService(scheduleId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule Deleted Successfully",
        data: result,
    });
});

export const scheduleControllers = {
    createSchedule,
    getMyScheduleService,
    getScheduleById,
    getAllSchedules,
    getTodaysSchedules,
    deleteSchedule,
    updateSchedule,
    publishSchedule


}