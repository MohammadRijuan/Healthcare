import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {

    if (!req.file) {
       throw new Error("No File Provided.")
    }

    const userId = req.user?.userId

    const result = await userServices.uploadProfileImageService(req.file?.buffer, userId!)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New tokens generated successfully",
        data: result,
    });
})


export const userController = {
    uploadProfileImage
}