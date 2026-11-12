import z from "zod";
export declare const ForgotPasswordZodSchema: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export declare const ResetPasswordZodSchema: z.ZodObject<{
    email: z.ZodEmail;
    otp: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const UserValidation: {
    UserRegistrationZodSchema: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodEmail;
        password: z.ZodString;
        patient: z.ZodOptional<z.ZodObject<{
            contactNumber: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    LoginZodSchema: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
    }, z.core.$strip>;
    ForgotPasswordZodSchema: z.ZodObject<{
        email: z.ZodEmail;
    }, z.core.$strip>;
    ResetPasswordZodSchema: z.ZodObject<{
        email: z.ZodEmail;
        otp: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
    UserEmailVerifyZodSchema: z.ZodObject<{
        email: z.ZodEmail;
        otp: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=auth.validation.d.ts.map