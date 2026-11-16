import { Router } from "express";
import { paymentControllers } from "./payment.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()


router.get("/my-payments", auth(Role.PATIENT), paymentControllers.getMyPayments);

router.get(
    "/all-payments",
    auth(Role.ADMIN, Role.SUPER_ADMIN),
    paymentControllers.getAllPayments,
);

router.get(
    "/:paymentId",
    auth(Role.PATIENT, Role.ADMIN, Role.SUPER_ADMIN),
    paymentControllers.getSinglePayment,
);

export const paymentRoutes = router