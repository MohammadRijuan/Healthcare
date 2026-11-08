import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/user/user.route";

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


app.use("/", (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "Congratulations ... Healthcare backend server is now live",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
