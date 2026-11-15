import { Router } from "express";
import { scheduleControllers } from "./schedule.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { CreateScheduleValidationZodSchema, UpdateScheduleValidationZodSchema } from "./schedule.validation";

const router = Router();

router.post(
  "/create-schedule",
  auth(Role.DOCTOR),
  validateRequest(CreateScheduleValidationZodSchema),
  scheduleControllers.createSchedule,
);

router.get(
  "/my-schedules",
  auth(Role.DOCTOR),
  scheduleControllers.getMyScheduleService,
);


router.get(
    "/all-schedules",
    auth(Role.ADMIN, Role.SUPER_ADMIN),
    scheduleControllers.getAllSchedules,
);

router.get("/todays-schedule", scheduleControllers.getTodaysSchedules);

router.patch(
    "/update-schedule/:scheduleId",
    auth(Role.DOCTOR),
    validateRequest(UpdateScheduleValidationZodSchema),
    scheduleControllers.updateSchedule,
);

router.patch(
    "/publish-schedule/:scheduleId",
    auth(Role.DOCTOR),
    scheduleControllers.publishSchedule,
);

router.get(
    "/:scheduleId",
    auth(Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
    scheduleControllers.getScheduleById,
);

router.delete(
    "/:scheduleId",
    auth(Role.DOCTOR),
    scheduleControllers.deleteSchedule,
);


export const scheduleRoutes = router;
