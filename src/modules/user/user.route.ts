import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";

const router = Router()

router.patch("/profile-image",auth(Role.ADMIN,Role.SUPER_ADMIN,Role.PATIENT,Role.DOCTOR),upload.single("profileImage"))


export const userRoutes = router