import z, { email } from "zod";

const UserRegistrationZodSchema = z.object({
  name: z
    .string("Not A String!!!!!")
    .min(3, "Name must atleast 3 characters long!!!")
    .max(10),

  email: z.email("Not email!!"),

  password: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

    .regex(/[0-9]/, "Password must contain atleast 1 Number")
    .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),

  patient: z
    .object({
      contactNumber: z.string().optional(),
    })
    .optional(),
});

 const UserEmailVerifyZodSchema = z.object({
    
    email: z.email("Not email!!"),
     otp: z.string().length(6)
   
})

const LoginZodSchema = z.object({
  email: z.email(),

  password: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
    .regex(/[0-9]/, "Password must contain atleast 1 Number")
    .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
});

export const ForgotPasswordZodSchema = z.object({
  email: z.email(),
});

export const ResetPasswordZodSchema = z.object({
  email: z.email(),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^[0-9]+$/, "OTP must contain only numbers."),

  newPassword: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter.")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter.")
    .regex(/[0-9]/, "Password must contain atleast 1 Number.")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain atleast 1 Special Character.",
    ),
});

export const UserValidation = {
  UserRegistrationZodSchema,
  LoginZodSchema,
  ForgotPasswordZodSchema,
  ResetPasswordZodSchema,
  UserEmailVerifyZodSchema
};
