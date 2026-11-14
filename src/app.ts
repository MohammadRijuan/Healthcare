import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	NextFunction,
	type Application,
	type Request,
	type Response,
} from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/user/user.route";
import { getBkashIdToken } from "./lib/bkash";
import  httpStatus from "http-status"
import { appointementRoutes } from "./modules/appointment/appointment.route";
import { doctorRoutes } from "./modules/doctor/doctor.route";
import { scheduleRoutes } from "./modules/schedule/schedule.validation";

const app: Application = express();

app.use(
	cors({
		origin: config.app_url,
		credentials: true,
	}),
);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




// all api
app.use("/api/v1/auth",authRoutes)

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/appointment", appointementRoutes);

app.use("/api/v1/doctor", doctorRoutes);

app.use("/api/v1/doctor", scheduleRoutes);




// testing

app.get("/test", async (req: Request, res: Response, next : NextFunction) => {

	try {

		const grantIdTokenResult = await getBkashIdToken()

		console.log(grantIdTokenResult);
		
		res.status(httpStatus.OK).json({
			success: true,
			message: "Welcome to PH Healthcare System Backend",
			data : null
		});
	} catch (error) {
		console.log(error);
		next(error)
	}
})




app.use("/", (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "Congratulations ... Healthcare backend server is now live",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
