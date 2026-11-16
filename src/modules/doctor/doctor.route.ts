import { Router } from "express";
import { doctorControllers } from "./doctor.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { UpdateDoctorProfileValidationZodSchema } from "./doctor.validation";

const router = Router();

router.post(
  "/apply-as-doctor",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "additionalFiles", maxCount: 10 },
  ]),
  doctorControllers.applyAsDoctor,
);

router.post(
  "/apply-as-doctor/verify-email",
  doctorControllers.verifyDoctorEmail,
);

router.post(
  "/approve-doctor",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  doctorControllers.approveDoctor,
);

router.get(
  "/all-doctors",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  doctorControllers.getAllDoctors,
);

router.patch(
	"/update-my-profile",
	auth(Role.DOCTOR),
	validateRequest(UpdateDoctorProfileValidationZodSchema),
	doctorControllers.updateDoctorProfile,
);

// Public doctor-discovery routes (no auth) — meant for patients browsing before login.
router.get(
	"/public/available-today",
	doctorControllers.getAvailableDoctorByTodaysSchedule,
);

router.get(
	"/public/all-doctors",
	doctorControllers.getAllDoctorsListPublic,
);

router.get(
	"/public/:doctorId",
	doctorControllers.getSingleDoctorPublicProfile,
);

export const doctorRoutes = router;
