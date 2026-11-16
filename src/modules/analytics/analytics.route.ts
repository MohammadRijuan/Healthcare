import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { analyticsControllers } from "./analytics.controller";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.get(
    "/patient-analytics",
    auth(Role.PATIENT),
    analyticsControllers.getPatientAnalytics,
);

router.get(
    "/doctor-analytics",
    auth(Role.DOCTOR),
    analyticsControllers.getDoctorAnalytics,
);

router.get(
    "/admin-analytics",
    auth(Role.ADMIN, Role.SUPER_ADMIN),
    analyticsControllers.getAdminAnalytics,
);

export const AnalyticsRoutes = router;