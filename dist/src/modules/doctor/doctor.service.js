"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorServices = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_1 = require("../../lib/cloudinary");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config"));
const enums_1 = require("../../../generated/prisma/enums");
const nodemailer_1 = require("../../lib/nodemailer");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const redis_1 = require("../../lib/redis");
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = require("../../utils/AppError");
const applyAsDoctor = async (payload, resume, //single file
additionalFiles) => {
    // before applying as doctor checking user exist or not
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: {
            email: payload.user.email,
        },
    });
    if (isUserExist) {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "User already exist with this email");
    }
    // single upload thats why only Promise
    const resumeUploadResult = await new Promise((resolve, reject) => {
        cloudinary_1.cloudinary.uploader
            .upload_stream({
            resource_type: "auto",
        }, async (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result) {
                return reject(new Error("No result returned from Cloudinary"));
            }
            resolve(result);
        })
            .end(resume?.buffer);
    });
    console.log({ resumeUploadResult });
    // multiple upload thats why use Promise.all
    const additionalFilesUploadResults = await Promise.all(additionalFiles.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary_1.cloudinary.uploader
                .upload_stream({
                resource_type: "auto",
            }, async (error, result) => {
                if (error) {
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("No result returned from Cloudinary"));
                }
                resolve(result);
            })
                .end(file.buffer);
        });
    }));
    console.log({ additionalFilesUploadResults });
    const randomDoctorPassword = Math.random().toString(36).slice(-8);
    // Example: "k8m2x9ab"
    const hashedPassword = await bcryptjs_1.default.hash(randomDoctorPassword, Number(config_1.default.bcrypt_salt_rounds));
    const doctorApplication = await prisma_1.prisma.user.create({
        data: {
            ...payload.user,
            password: hashedPassword,
            role: enums_1.Role.DOCTOR,
            needPasswordChange: true,
            doctor: {
                create: {
                    name: payload.user.name,
                    email: payload.user.email,
                    ...payload.doctor,
                    resume: resumeUploadResult.secure_url,
                    resumePublicId: resumeUploadResult.public_id,
                    additionalFiles: additionalFilesUploadResults.map((file) => ({
                        url: file.secure_url,
                        publicId: file.public_id,
                    })),
                },
            },
        },
        include: {
            doctor: true,
        },
    });
    const expirationSeconds = 60 * 60; //1 hour
    const otpKey = `doctor-application-otp:${payload.user.email}`;
    const otpValue = crypto_1.default.randomInt(100000, 1000000).toString();
    await redis_1.redisClient.set(otpKey, otpValue, {
        expiration: {
            type: "EX",
            value: expirationSeconds,
        },
    });
    const tempatePath = path_1.default.join(process.cwd(), "src/app/templates/registration-user-otp.ejs");
    const templateData = {
        name: payload.user.name,
        email: payload.user.email,
        otp: otpValue,
        expirationMinutes: expirationSeconds / 60,
    };
    const html = await ejs_1.default.renderFile(tempatePath, templateData);
    await nodemailer_1.transporter.sendMail({
        from: config_1.default.email_sender,
        to: payload.user.email,
        subject: "Doctor Application - Email Verification",
        html,
    });
    return doctorApplication;
};
const verifyDoctorEmailService = async (payload) => {
    const otp = payload.otp;
    const email = payload.email.trim().toLowerCase();
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: {
            email,
            role: enums_1.Role.DOCTOR,
        },
    });
    if (!isUserExist) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Doctor Application Not Found. Please Apply Again.");
    }
    if (isUserExist.emailVerified) {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "Email already verified");
    }
    const otpKey = `doctor-application-otp:${email}`;
    // get otp key from redis
    const redisOtp = await redis_1.redisClient.get(otpKey);
    if (!redisOtp) {
        throw new AppError_1.AppError(http_status_1.default.GONE, "OTP Expired. Your Application Window Has Closed, Please Apply Again.");
    }
    if (redisOtp !== otp) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "OTP Does Not Match");
    }
    await redis_1.redisClient.del(otpKey);
    const verifiedUser = await prisma_1.prisma.user.update({
        where: { id: isUserExist.id },
        data: { emailVerified: true },
        omit: { password: true },
        include: { doctor: true },
    });
    return verifiedUser;
};
const approveDoctorService = async (payload, reviewer) => {
    const { doctorId, verificationStatus, rejectionReason } = payload;
    const existingDoctor = await prisma_1.prisma.doctor.findUnique({
        where: { id: doctorId },
        include: { user: true },
    });
    if (!existingDoctor) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Doctor Application Not Found");
    }
    if (existingDoctor.isDeleted) {
        throw new AppError_1.AppError(http_status_1.default.GONE, "Doctor Application Has Been Deleted");
    }
    if (!existingDoctor.user.emailVerified) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "Doctor Has Not Verified Their Email Yet. Application Cannot Be Reviewed.");
    }
    if (existingDoctor.verificationStatus !== enums_1.DoctorVerificationStatus.PENDING) {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, `Doctor Application Has Already Been ${existingDoctor.verificationStatus.toLowerCase()}`);
    }
    if (verificationStatus === enums_1.DoctorVerificationStatus.REJECTED &&
        !rejectionReason) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Rejection Reason Is Required When Rejecting A Doctor Application");
    }
    const updatedDoctor = await prisma_1.prisma.doctor.update({
        where: { id: doctorId },
        data: {
            verificationStatus,
            rejectionReason: verificationStatus === enums_1.DoctorVerificationStatus.REJECTED
                ? rejectionReason
                : null,
            reviewedBy: reviewer.userId,
            reviewedAt: new Date(),
        },
    });
    const isApproved = verificationStatus === enums_1.DoctorVerificationStatus.APPROVED;
    const tempatePath = path_1.default.join(process.cwd(), `src/app/templates/${isApproved
        ? "doctor-application-approved.ejs"
        : "doctor-application-rejected.ejs"}`);
    const templateData = {
        name: updatedDoctor.name,
        reason: updatedDoctor.rejectionReason,
    };
    const html = await ejs_1.default.renderFile(tempatePath, templateData);
    await nodemailer_1.transporter.sendMail({
        from: config_1.default.email_sender,
        to: updatedDoctor.email,
        subject: isApproved
            ? "Your Doctor Application Has Been Approved"
            : "Your Doctor Application Has Been Rejected",
        html,
    });
    return updatedDoctor;
};
const getAllDoctorsService = async (query) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";
    const andConditions = [];
    //Searching
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                { name: { contains: query.searchTerm, mode: "insensitive" } },
                { email: { contains: query.searchTerm, mode: "insensitive" } },
                {
                    specialization: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    licenseNumber: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
        });
    }
    //filtering
    if (query.specialization) {
        andConditions.push({
            specialization: { equals: query.specialization, mode: "insensitive" },
        });
    }
    if (query.email) {
        andConditions.push({
            email: { contains: query.email, mode: "insensitive" },
        });
    }
    if (query.licenseNumber) {
        andConditions.push({
            licenseNumber: { equals: query.licenseNumber, mode: "insensitive" },
        });
    }
    if (query.verificationStatus) {
        andConditions.push({
            verificationStatus: query.verificationStatus,
        });
    }
    andConditions.push({ isDeleted: false });
    const allDoctors = await prisma_1.prisma.doctor.findMany({
        where: {
            AND: andConditions.length > 0 ? andConditions : [],
        },
        take: limit,
        skip: skip,
        orderBy: {
            // sortBy : sortOrder
            [sortBy]: sortOrder,
        },
        include: {
            user: {
                omit: {
                    password: true,
                },
            },
            // schedules: true,
            // appointments: true
            // prescriptions: true
        },
    });
    const totalDoctorCount = await prisma_1.prisma.doctor.count({
        where: {
            AND: andConditions,
        },
    });
    return {
        data: allDoctors,
        meta: {
            page: page,
            limit: limit,
            total: totalDoctorCount,
            totalPages: Math.ceil(totalDoctorCount / limit),
        },
    };
};
exports.doctorServices = {
    applyAsDoctor,
    verifyDoctorEmailService,
    approveDoctorService,
    getAllDoctorsService,
};
//# sourceMappingURL=doctor.service.js.map