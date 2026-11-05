import { Router } from "express";
import { authControllers } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidation } from "./auth.validation";

const router = Router()


router.post("/register",validateRequest(UserValidation.UserRegistrationZodSchema),authControllers.registerUser)
router.post("/login",validateRequest(UserValidation.LoginZodSchema),authControllers.loginUser)
router.get("/me",authControllers.getMyProfile)


router.post("/refresh-token",authControllers.refreshToken)
router.post("/google",authControllers.googleLogin)


export const authRoutes = router