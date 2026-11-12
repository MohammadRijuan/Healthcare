"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointementRoutes = void 0;
const express_1 = require("express");
const appointment_controller_1 = require("./appointment.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const enums_1 = require("../../../generated/prisma/enums");
const router = (0, express_1.Router)();
router.post("/book-appointment", appointment_controller_1.appointmentControllers.bookAppointment);
router.post("/pay-appointment", (0, checkAuth_1.auth)(enums_1.Role.PATIENT), appointment_controller_1.appointmentControllers.payAppointment);
router.post("/cancel-appointment", (0, checkAuth_1.auth)(enums_1.Role.PATIENT, enums_1.Role.ADMIN, enums_1.Role.SUPER_ADMIN), appointment_controller_1.appointmentControllers.cancelAppointment);
//book appointment callback url
router.get("/book-appointment/payment/callback", appointment_controller_1.appointmentControllers.bookAppointmentCallback);
exports.appointementRoutes = router;
//# sourceMappingURL=appointment.route.js.map