import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { appointmentServices } from "./appointment.service";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {

  const payload = req.body;
  const user = req.user!;
  const result = await appointmentServices.bookAppointment(payload, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const payAppointment = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user!;

  const result = await appointmentServices.payAppointment(payload, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment Payment Initiated Successfully",
    data: result,
  });
});

const bookAppointmentCallback = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.query, "req.query");
    const { executedPaymentResult, redirectUrl } =
      await appointmentServices.bookAppointmentCallback(req.query);

    console.log({ executedPaymentResult }, "callback controller");

    res.redirect(redirectUrl);
    // sendResponse(res, {
    //     statusCode: httpStatus.OK,
    //     success: true,
    //     message: "User profile fetched successfully",
    //     data: result,
    // });
  },
);

const cancelAppointment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await appointmentServices.cancelAppointment(payload);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Appointment Cancelled And Refunded Successfully",
		data: result,
	});
});

export const appointmentControllers = {
  bookAppointment,
  bookAppointmentCallback,
  payAppointment,
  cancelAppointment

};
