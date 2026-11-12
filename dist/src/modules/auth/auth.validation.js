"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = exports.ResetPasswordZodSchema = exports.ForgotPasswordZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const UserRegistrationZodSchema = zod_1.default.object({
    name: zod_1.default
        .string("Not A String!!!!!")
        .min(3, "Name must atleast 3 characters long!!!")
        .max(10),
    email: zod_1.default.email("Not email!!"),
    password: zod_1.default
        .string()
        .min(8, "Password Must Minimum 8 Characters Long.")
        .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
        .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
        .regex(/[0-9]/, "Password must contain atleast 1 Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
    patient: zod_1.default
        .object({
        contactNumber: zod_1.default.string().optional(),
    })
        .optional(),
});
const UserEmailVerifyZodSchema = zod_1.default.object({
    email: zod_1.default.email("Not email!!"),
    otp: zod_1.default.string().length(6)
});
const LoginZodSchema = zod_1.default.object({
    email: zod_1.default.email(),
    password: zod_1.default
        .string()
        .min(8, "Password Must Minimum 8 Characters Long.")
        .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
        .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
        .regex(/[0-9]/, "Password must contain atleast 1 Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
});
exports.ForgotPasswordZodSchema = zod_1.default.object({
    email: zod_1.default.email(),
});
exports.ResetPasswordZodSchema = zod_1.default.object({
    email: zod_1.default.email(),
    otp: zod_1.default
        .string()
        .length(6, "OTP must be exactly 6 digits.")
        .regex(/^[0-9]+$/, "OTP must contain only numbers."),
    newPassword: zod_1.default
        .string()
        .min(8, "Password Must Minimum 8 Characters Long.")
        .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter.")
        .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter.")
        .regex(/[0-9]/, "Password must contain atleast 1 Number.")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character."),
});
exports.UserValidation = {
    UserRegistrationZodSchema,
    LoginZodSchema,
    ForgotPasswordZodSchema: exports.ForgotPasswordZodSchema,
    ResetPasswordZodSchema: exports.ResetPasswordZodSchema,
    UserEmailVerifyZodSchema
};
//# sourceMappingURL=auth.validation.js.map