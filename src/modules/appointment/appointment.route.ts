import { Router } from "express";
import { appointmentControllers } from "./appointment.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { UpdateAppointmentStatusValidationZodSchema } from "./appoinment.validation";

const router = Router();

router.post("/book-appointment", appointmentControllers.bookAppointment);

router.post(
  "/pay-appointment",
  auth(Role.PATIENT),
  appointmentControllers.payAppointment,
);

router.post(
  "/cancel-appointment",
  auth(Role.PATIENT, Role.ADMIN, Role.SUPER_ADMIN),
  appointmentControllers.cancelAppointment,
);

//book appointment callback url
router.get(
  "/book-appointment/payment/callback",
  appointmentControllers.bookAppointmentCallback,
);

router.patch(
  "/update-status/:appointmentId",
  auth(Role.DOCTOR),
  validateRequest(UpdateAppointmentStatusValidationZodSchema),
  appointmentControllers.updateAppointmentStatus,
);

router.get(
  "/my-appointments",
  auth(Role.PATIENT),
  appointmentControllers.getMyAppointments,
);

router.get(
  "/doctor-appointments",
  auth(Role.DOCTOR),
  appointmentControllers.getDoctorAppointments,
);

router.get(
  "/all-appointments",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  appointmentControllers.getAllAppointments,
);

router.get(
  "/:appointmentId",
  auth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  appointmentControllers.getSingleAppointment,
);

export const appointementRoutes = router;
