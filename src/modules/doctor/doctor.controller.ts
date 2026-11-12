import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { ApplyAsDoctorValidationZodSchema } from "./doctor.validation";
import { doctorServices } from "./doctor.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const applyAsDoctor = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	console.log({ files });
	const resume = files?.["resume"]?.[0] ?? null;
	const additionalFiles = files?.["additionalFiles"] || [];

	const zodValidationResult = ApplyAsDoctorValidationZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult.error.issues[0]?.message ?? "Invalid doctor application data",
		);
	}

  // const payload = zodValidationResult.data;

	const { address, bio, consultationFee, contactNumber, ...doctor } =
		zodValidationResult.data.doctor;
    
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

	const result = await doctorServices.applyAsDoctor(
		payload,
		resume,
		additionalFiles,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied As Doctor Successfuly",
		data: result,
	});
});

const verifyDoctorEmail= catchAsync(async(req:Request,res:Response)=>{
  const payload = req.body;

	const result = await doctorServices.verifyDoctorEmailService(payload)
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor Email Verified Successfully",
		data: result,
	});
})

const approveDoctor= catchAsync(async(req:Request,res:Response)=>{
  const payload = req.body;
	const user = req.user!

	const result = await doctorServices.approveDoctorService(payload, user)
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor Email Verified Successfully",
		data: result,
	});

})

const getAllDoctors= catchAsync(async(req:Request,res:Response)=>{
  const {data, meta} = await doctorServices.getAllDoctorsService(req.query)
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctors Retrieved Successfully",
		data: data,
		meta : meta,
	});

})

export const doctorControllers = {
  applyAsDoctor,
  verifyDoctorEmail,
  approveDoctor,
  getAllDoctors
};
