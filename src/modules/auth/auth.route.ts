import { Router } from "express";
import { authControllers } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidation } from "./auth.validation";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()


router.post("/register",validateRequest(UserValidation.UserRegistrationZodSchema),authControllers.registerUser)
router.post("/verify-email",validateRequest(UserValidation.UserEmailVerifyZodSchema),authControllers.verifyUserEmail)
router.post("/login",validateRequest(UserValidation.LoginZodSchema),authControllers.loginUser)
router.get("/me",auth(Role.SUPER_ADMIN,Role.ADMIN,Role.DOCTOR,Role.PATIENT),authControllers.getMyProfile)


router.post("/refresh-token",authControllers.refreshToken)
router.post("/google",authControllers.googleLogin)

router.post("/forgot-password",validateRequest(UserValidation.ForgotPasswordZodSchema),authControllers.forgotPassword)
router.post("/reset-password",validateRequest(UserValidation.ResetPasswordZodSchema),authControllers.resetPassword)


export const authRoutes = router