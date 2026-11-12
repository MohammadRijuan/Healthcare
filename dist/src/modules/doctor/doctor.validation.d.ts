import { z } from "zod";
export declare const ApplyAsDoctorValidationZodSchema: z.ZodObject<{
    user: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodEmail;
    }, z.core.$strip>;
    doctor: z.ZodObject<{
        address: z.ZodOptional<z.ZodString>;
        specialization: z.ZodString;
        licenseNumber: z.ZodString;
        qualifications: z.ZodString;
        experienceYears: z.ZodNumber;
        bio: z.ZodOptional<z.ZodString>;
        consultationFee: z.ZodOptional<z.ZodNumber>;
        contactNumber: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=doctor.validation.d.ts.map