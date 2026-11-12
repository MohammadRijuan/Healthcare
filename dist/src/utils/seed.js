"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTesterDoctor = exports.seedTesterAdmin = exports.seedSuperAdmin = void 0;
const enums_1 = require("../../generated/prisma/enums");
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const prisma_1 = require("../lib/prisma");
const AppError_1 = require("./AppError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedSuperAdmin = async () => {
    try {
        const isSuperAdmin = await prisma_1.prisma.user.findFirst({
            where: {
                role: enums_1.Role.SUPER_ADMIN,
            },
        });
        if (isSuperAdmin) {
            console.log("super admin already exist");
            return;
        }
        const name = config_1.default.super_admin_name;
        const email = config_1.default.super_admin_email;
        const password = config_1.default.super_admin_password;
        if (!name || !email || !password) {
            throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, "Super Admin name,email,password missing in env file");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
        const superAdmin = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: enums_1.Role.SUPER_ADMIN,
                needPasswordChange: false,
                emailVerified: true,
            },
        });
        console.log("super admin created : ", superAdmin);
    }
    catch (error) {
        console.log("Error Seeding Super Admin : ", error);
        await prisma_1.prisma.user.delete({
            where: {
                email: config_1.default.super_admin_email,
            },
        });
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
const seedTesterAdmin = async () => {
    try {
        const istesterAdmin = await prisma_1.prisma.user.findUnique({
            where: {
                email: config_1.default.tester_admin_email,
            },
        });
        if (istesterAdmin) {
            console.log("tester admin already exist");
            return;
        }
        const name = config_1.default.tester_admin_name;
        const email = config_1.default.tester_admin_email;
        const password = config_1.default.tester_admin_password;
        if (!name || !email || !password) {
            throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, "Tester Admin name,email,password missing in env file");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
        const testerAdmin = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                role: enums_1.Role.ADMIN,
                needPasswordChange: false,
                emailVerified: true,
            },
        });
        console.log("tester admin created", testerAdmin);
    }
    catch (error) {
        console.log("Error Seeding tester Admin : ", error);
        await prisma_1.prisma.user.delete({
            where: {
                email: config_1.default.tester_admin_email,
            },
        });
    }
};
exports.seedTesterAdmin = seedTesterAdmin;
const seedTesterDoctor = async () => {
    try {
        const isTesterDoctor = await prisma_1.prisma.user.findUnique({
            where: {
                email: config_1.default.tester_doctor_email,
            },
        });
        if (isTesterDoctor) {
            console.log("tester doctor is already exist");
            return;
        }
        const name = config_1.default.tester_doctor_name;
        const email = config_1.default.tester_doctor_email;
        const password = config_1.default.tester_doctor_password;
        if (!name || !email || !password) {
            throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, "tester doctor name,email,password not exist in env file");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
        const testerDoctor = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                role: enums_1.Role.DOCTOR,
                needPasswordChange: true,
                emailVerified: true,
                doctor: {
                    create: {
                        email,
                        name,
                        experienceYears: 5,
                        licenseNumber: "BMDC0000",
                        qualifications: "MBBS",
                        specialization: "Gynocologist"
                    }
                }
            },
        });
        console.log("tester Doctor created successfully....", testerDoctor);
    }
    catch (error) {
        console.log("Error Seeding tester doctor: ", error);
        await prisma_1.prisma.user.delete({
            where: {
                email: config_1.default.tester_doctor_email,
            },
        });
    }
};
exports.seedTesterDoctor = seedTesterDoctor;
//# sourceMappingURL=seed.js.map