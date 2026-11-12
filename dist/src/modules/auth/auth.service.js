"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authServices = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
const enums_1 = require("../../../generated/prisma/enums");
const jwt_1 = require("../../utils/jwt");
const config_1 = __importDefault(require("../../config"));
const googleAuth_1 = require("../../lib/googleAuth");
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../../lib/redis");
const nodemailer_1 = require("../../lib/nodemailer");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = require("../../utils/AppError");
const registerUserService = async (payload) => {
    const { name, password, patient: patientData } = payload;
    const email = payload.email.trim().toLowerCase();
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (isUserExist) {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "User with this email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 8);
    const expirationSeconds = 5 * 60;
    const otpKey = `patient-registration-otp:${email}`;
    const otpValue = crypto_1.default.randomInt(100000, 1000000).toString();
    await redis_1.redisClient.set(otpKey, otpValue, {
        expiration: {
            type: "EX",
            value: expirationSeconds,
        },
    });
    const userRegistrationKey = `patient-registration-data:${email}`;
    const redisUserDataPayload = {
        name,
        email,
        password: hashedPassword,
        patient: patientData,
    };
    await redis_1.redisClient.set(userRegistrationKey, JSON.stringify(redisUserDataPayload), {
        expiration: {
            type: "EX",
            value: expirationSeconds,
        },
    });
    const templatePath = path_1.default.join(process.cwd(), "src/templates/registration-user-otp.ejs");
    const templateData = {
        name,
        email,
        otp: otpValue,
        expirationMinutes: expirationSeconds / 60,
    };
    const html = await ejs_1.default.renderFile(templatePath, templateData);
    await nodemailer_1.transporter.sendMail({
        from: config_1.default.email_sender,
        to: email,
        subject: "Email verification",
        html,
    });
    // const createUser = await prisma.user.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //     role: Role.PATIENT,
    //     status: UserStatus.ACTIVE,
    //     emailVerified: false,
    //     patient: {
    //       create: {
    //         name,
    //         email,
    //       },
    //     },
    //   },
    //   omit: {
    //     password: true,
    //   },
    //   include: {
    //     patient: true,
    //   },
    // });
    // const { patient, ...user } = createUser;
    // const jwtPayload = {
    //   userId: user.id,
    //   name: user.name,
    //   email: user.email,
    //   role: user.role,
    // };
    // const accessToken = jwtUtils.createToken(
    //   jwtPayload,
    //   config.jwt_access_secret,
    //   config.jwt_access_expires_in as SignOptions,
    // );
    // const refreshToken = jwtUtils.createToken(
    //   jwtPayload,
    //   config.jwt_refresh_secret,
    //   config.jwt_refresh_expires_in as SignOptions,
    // );
    // return {
    //   user,
    //   patient,
    //   accessToken,
    //   refreshToken,
    // };
};
const verifyUserEmailService = async (payload) => {
    const otp = payload.otp;
    const email = payload.email.trim().toLowerCase();
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (isUserExist?.status === "BLOCKED") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is Blocked");
    }
    if (isUserExist?.emailVerified) {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "Email ALready Verified");
    }
    if (isUserExist?.isDeleted || isUserExist?.status === "DELETED") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is Deleted");
    }
    const otpKey = `patient-registration-otp:${email}`;
    const redisOtp = await redis_1.redisClient.get(otpKey);
    if (!redisOtp) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Invalid OTP");
    }
    if (redisOtp !== otp) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "OTP Does Not Match");
    }
    const userRegistrationKey = `patient-registration-data:${email}`;
    const redisUserData = await redis_1.redisClient.get(userRegistrationKey);
    if (!redisUserData) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Patient Doesnt Exist");
    }
    const userPayload = JSON.parse(redisUserData);
    const createdUser = await prisma_1.prisma.user.create({
        data: {
            name: userPayload.name,
            email: userPayload.email,
            password: userPayload.password,
            role: enums_1.Role.PATIENT,
            status: enums_1.UserStatus.ACTIVE,
            emailVerified: true,
            patient: {
                create: {
                    name: userPayload.name,
                    email: userPayload.email,
                    contactNumber: userPayload?.patient?.contactNumber || "",
                },
            },
        },
        omit: { password: true },
        include: { patient: true },
    });
    await redis_1.redisClient.del(userRegistrationKey);
    const tempatePath = path_1.default.join(process.cwd(), "src/templates/patient-welcome-email.ejs");
    const templateData = {
        name: createdUser.name,
    };
    const html = await ejs_1.default.renderFile(tempatePath, templateData);
    await nodemailer_1.transporter.sendMail({
        from: config_1.default.email_sender,
        to: email,
        subject: "Welcome To PH Healthcare System",
        // text : `Your OTP is ${otp}`
        // html: `<h1>Your OTP is ${otp}</h1>`
        html,
    });
    const { patient, ...user } = createdUser;
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        user,
        patient,
        accessToken,
        refreshToken,
    };
};
const loginUserService = async (payload) => {
    const { password } = payload;
    const email = payload.email.trim().toLowerCase();
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "User not found");
    }
    if (user.status === enums_1.UserStatus.BLOCKED) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is blocked");
    }
    if (user.isDeleted || user.status === enums_1.UserStatus.DELETED) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is deleted");
    }
    if (user.password === null && user.googleId !== null) {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "User Already Has Account Registered With Google. Try To Login With Google.");
    }
    const isPasswordMatched = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    }
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
};
const getMyProfileService = async (user) => {
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            patient: true,
        },
        omit: {
            password: true,
        },
    });
    if (!isUserExist) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "user not found");
    }
    return isUserExist;
};
const refreshTokenService = async (token) => {
    const verifiedRefreshToken = jwt_1.jwtUtils.verifyToken(token, config_1.default.jwt_refresh_secret);
    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, config_1.default.node_env === "development"
            ? verifiedRefreshToken.error
            : "Invalid refresh token");
    }
    const data = verifiedRefreshToken.data;
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: data?.userId,
        },
    });
    if (!user || user.isDeleted || user.status !== enums_1.UserStatus.ACTIVE) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "User is inactive or not found");
    }
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
};
const googleLoginService = async (payload) => {
    // Store the decoded Google ID token payload.
    // It will contain information such as Google's user ID, email and name.
    let googleIdTokenPayload = null;
    // Verify the Google ID token to ensure it was genuinely issued by Google.
    // The audience must match our application's Google Client ID.
    try {
        const ticket = await googleAuth_1.googleClient.verifyIdToken({
            idToken: payload.idToken,
            audience: config_1.default.google_client_id, //client id
        });
        // Extract the user's information from the verified Google token.
        googleIdTokenPayload = ticket.getPayload();
    }
    catch (error) {
        // If verification fails, the token may be invalid, expired or incorrectly signed.
        console.log("Google Id Token verification failed", error);
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "Invalid or Expired Google id token");
    }
    // Make sure Google returned a valid payload before accessing its properties.
    if (!googleIdTokenPayload) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "Invalid or Expired Google Id Token");
    }
    // Email is required to identify the user in our database.
    if (!googleIdTokenPayload.email) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "Google Email not Found");
    }
    // Name is required when creating a new patient account.
    if (!googleIdTokenPayload.name) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "Google Email User Name Not Found");
    }
    // Check whether a patient already exists with this Google ID and email.
    // This handles users who have previously logged in using Google.
    const ifPatientExistWithGoogleAuth = await prisma_1.prisma.user.findUnique({
        where: {
            email: googleIdTokenPayload.email,
            role: enums_1.Role.PATIENT,
            googleId: googleIdTokenPayload.sub,
        },
    });
    // If an existing Google-authenticated patient is found,
    // use that user instead of creating a new account.
    let user = ifPatientExistWithGoogleAuth;
    // If no Google-authenticated account exists, check whether
    // the same email is already registered using email and password.
    if (!ifPatientExistWithGoogleAuth) {
        const ifPatientExistWithCredentials = await prisma_1.prisma.user.findUnique({
            where: {
                email: googleIdTokenPayload.email,
                role: enums_1.Role.PATIENT,
                authProvider: enums_1.AuthProvider.CREDENTIAL,
            },
        });
        // If a credential-based account exists, link the Google account
        // to that existing account instead of creating a duplicate.
        if (ifPatientExistWithCredentials) {
            // Only verified email accounts can be linked with Google.
            if (!ifPatientExistWithCredentials.emailVerified) {
                throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "Email not verified");
            }
            // Prevent blocked users from logging in through Google.
            if (ifPatientExistWithCredentials.status === enums_1.UserStatus.BLOCKED) {
                throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User Is Blocked");
            }
            // Prevent deleted accounts from being linked or accessed.
            if (ifPatientExistWithCredentials.isDeleted ||
                ifPatientExistWithCredentials.status === enums_1.UserStatus.DELETED) {
                throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User Is Deleted");
            }
            // Link Google's unique user ID (sub) with the existing account.
            // After linking, the user can log in using either authentication method.
            user = await prisma_1.prisma.user.update({
                where: {
                    id: ifPatientExistWithCredentials.id,
                },
                data: {
                    googleId: googleIdTokenPayload.sub,
                },
            });
        }
        else {
            // If neither a Google account nor a credential account exists,
            // create a completely new patient account using Google's information.
            user = await prisma_1.prisma.user.create({
                data: {
                    name: googleIdTokenPayload.name,
                    email: googleIdTokenPayload.email,
                    role: enums_1.Role.PATIENT,
                    googleId: googleIdTokenPayload.sub,
                    authProvider: enums_1.AuthProvider.GOOGLE,
                    // Google has already verified the email address.
                    emailVerified: true,
                    // Create the associated patient profile simultaneously
                    // using Prisma's nested create operation.
                    patient: {
                        create: {
                            name: googleIdTokenPayload.name,
                            email: googleIdTokenPayload.email,
                        },
                    },
                },
            });
            const tempatePath = path_1.default.join(process.cwd(), "src/templates/patient-welcome-email.ejs");
            const templateData = {
                name: user.name,
            };
            const html = await ejs_1.default.renderFile(tempatePath, templateData);
            await nodemailer_1.transporter.sendMail({
                from: config_1.default.email_sender,
                to: user.email,
                subject: "Welcome To PH Healthcare System",
                // text : `Your OTP is ${otp}`
                // html: `<h1>Your OTP is ${otp}</h1>`
                html,
            });
        }
    }
    // Ensure that a valid user object is available before generating tokens.
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User Not Found");
    }
    // Perform a final account-status check.
    // This also protects existing Google users from accessing blocked accounts.
    if (user.status === enums_1.UserStatus.BLOCKED) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User Is Blocked");
    }
    // Prevent deleted users from logging in, regardless of their authentication method.
    if (user.isDeleted || user.status === enums_1.UserStatus.DELETED) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User Is Deleted");
    }
    // Prepare the payload that will be stored inside the JWT tokens.
    // These details identify the authenticated user throughout the application.
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    // Generate an access token.
    // The access token is used to authenticate requests to protected APIs.
    const accessToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    // Generate a refresh token.
    // The refresh token is used to obtain a new access token when the current
    // access token expires, without requiring the user to log in again.
    const refreshToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    // Return both tokens to the controller so they can be sent to the client.
    return {
        accessToken,
        refreshToken,
    };
};
const forgotPaswordService = async (payload) => {
    const { email } = payload;
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!isUserExist) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User Does not exist");
    }
    if (isUserExist.status === "BLOCKED") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is blocked");
    }
    if (isUserExist.email === "false") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User email is not verified");
    }
    if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is deleted");
    }
    if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "user has account with google id");
    }
    const otp = crypto_1.default.randomInt(100000, 1000000);
    const key = `forgot-password-otp : ${isUserExist.email}`;
    const expirationSeconds = 5 * 60;
    await redis_1.redisClient.set(key, otp, {
        expiration: {
            type: "EX",
            value: 5 * 60,
        },
    });
    // set a template structure for getting otp message
    // starting
    const tempatePath = path_1.default.join(process.cwd(), "src/templates/forgot-password.ejs");
    const templateData = {
        name: isUserExist.name,
        otp,
        expirationMinutes: expirationSeconds / 60,
    };
    const html = await ejs_1.default.renderFile(tempatePath, templateData);
    // end
    await nodemailer_1.transporter.sendMail({
        from: config_1.default.email_sender,
        to: isUserExist.email,
        subject: "Forgot password",
        // text: `Your otp is ${otp}`,
        html,
    });
};
const resetPaswordService = async (payload) => {
    const { email, otp, newPassword } = payload;
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!isUserExist) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User Does not exist");
    }
    if (isUserExist.status === "BLOCKED") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is blocked");
    }
    if (isUserExist.email === "false") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User email is not verified");
    }
    if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "User is deleted");
    }
    if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "user has account with google id");
    }
    const key = `forgot-password-otp : ${isUserExist.email}`;
    const redisOtp = await redis_1.redisClient.get(key);
    if (!redisOtp) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Invalid otp");
    }
    if (redisOtp !== otp) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Otp does not match");
    }
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    await prisma_1.prisma.user.update({
        where: {
            email: isUserExist.email,
        },
        data: {
            password: hashedNewPassword,
        },
    });
    await redis_1.redisClient.del([key]);
    // set a template structure for getting otp message
    // starting
    const tempatePath = path_1.default.join(process.cwd(), "src/templates/reset-password-success.ejs");
    const templateData = {
        name: isUserExist.name,
    };
    const html = await ejs_1.default.renderFile(tempatePath, templateData);
    await nodemailer_1.transporter.sendMail({
        from: config_1.default.email_sender,
        to: isUserExist.email,
        subject: "Password Changed",
        // text : `Your OTP is ${otp}`
        // html: `<h1>Your Password Is Changed</h1>`
        html,
    });
};
exports.authServices = {
    registerUserService,
    loginUserService,
    getMyProfileService,
    refreshTokenService,
    googleLoginService,
    forgotPaswordService,
    resetPaswordService,
    verifyUserEmailService,
};
//# sourceMappingURL=auth.service.js.map