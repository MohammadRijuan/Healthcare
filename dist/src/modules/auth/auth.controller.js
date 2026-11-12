"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const auth_service_1 = require("./auth.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = require("../../utils/AppError");
// const UserRegisterSchemaZod = z.object({
//   name: z.string(),
//   email: z.email(),
//   password: z.string(),
//   patient: z
//     .object({
//       contactNumber: string().optional(),
//     })
//     .optional(),
// });
const registerUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // const payload = PatientValidation.PatientRegistrationZodSchema.safeParse(req.body);
    // if(!payload.success){
    // 	console.log(payload.error);
    // 	console.log(payload.error.issues);
    // 	throw new Error(payload.error.issues[0].message)
    // }
    // console.log(payload);
    const payload = req.body;
    await auth_service_1.authServices.registerUserService(payload);
    // const { accessToken, refreshToken, user, patient } = result;
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "none",
    //   maxAge: 10000 * 60 * 60 * 24, //24 hour or 1day
    // });
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "none",
    //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    // });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Otp has sent to your email to verify",
        // data: {
        //   accessToken,
        //   refreshToken,
        //   user,
        //   patient,
        // },
        data: null,
    });
});
const verifyUserEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await auth_service_1.authServices.verifyUserEmailService(payload);
    const { accessToken, refreshToken, user, patient } = result;
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Email Verified Successfully",
        data: {
            accessToken,
            refreshToken,
            user,
            patient,
        },
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await auth_service_1.authServices.loginUserService(payload);
    const { accessToken, refreshToken } = result;
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 10000 * 60 * 60 * 24, //24 hour or 1day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "user logged in successfully",
        data: {
            accessToken,
            refreshToken,
        },
    });
});
const getMyProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "user information is missing in the request");
    }
    const result = await auth_service_1.authServices.getMyProfileService(user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});
const refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.cookies.refreshToken) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await auth_service_1.authServices.refreshTokenService(req.cookies.refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = result;
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken,
        },
    });
});
const googleLogin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await auth_service_1.authServices.googleLoginService(payload);
    const { accessToken, refreshToken } = result;
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken,
        },
    });
});
const forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    await auth_service_1.authServices.forgotPaswordService(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `otp sent to email : ${payload.email}`,
        data: null,
    });
});
const resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    await auth_service_1.authServices.resetPaswordService(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password Changed successfully",
        data: null,
    });
});
exports.authControllers = {
    registerUser,
    loginUser,
    getMyProfile,
    refreshToken,
    googleLogin,
    forgotPassword,
    resetPassword,
    verifyUserEmail,
};
//# sourceMappingURL=auth.controller.js.map