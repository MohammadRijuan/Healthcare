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

export const scheduleControllers = {
    createSchedule,
    getMyScheduleService,
    getScheduleById


}