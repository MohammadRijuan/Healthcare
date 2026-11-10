import { Router } from "express";
import { appointmentControllers } from "./appointment.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();


router.post("/book-appointment", appointmentControllers.bookAppointment)

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
router.get("/book-appointment/payment/callback", appointmentControllers.bookAppointmentCallback )

export const appointementRoutes = router;