"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyAsDoctorValidationZodSchema = void 0;
const zod_1 = require("zod");
exports.ApplyAsDoctorValidationZodSchema = zod_1.z.object({
    user: zod_1.z.object({
        name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters long"),
        email: zod_1.z.email("Invalid email address").trim().toLowerCase(),
    }),
    doctor: zod_1.z.object({
        address: zod_1.z
            .string()
            .trim()
            .min(5, "Address must be at least 5 characters long")
            .optional(),
        specialization: zod_1.z.string().trim().min(2, "Specialization is required"),
        licenseNumber: zod_1.z.string().trim().min(3, "License number is required"),
        qualifications: zod_1.z.string().trim().min(2, "Qualifications are required"),
        // Handles converting incoming FormData strings like "12" into an integer number
        experienceYears: zod_1.z
            .number()
            .int("Experience years must be an integer")
            .min(0, "Experience years cannot be negative"),
        bio: zod_1.z
            .string()
            .trim()
            .max(1000, "Bio cannot exceed 1000 characters")
            .optional(),
        // Handles converting incoming FormData strings like "150.00" into a float number
        consultationFee: zod_1.z
            .number()
            .min(0, "Consultation fee cannot be negative")
            .optional(),
        contactNumber: zod_1.z
            .string()
            .trim()
            .min(5, "Contact number is invalid")
            .optional(),
    }),
});
//# sourceMappingURL=doctor.validation.js.map