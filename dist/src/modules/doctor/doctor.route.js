"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorRoutes = void 0;
const express_1 = require("express");
const doctor_controller_1 = require("./doctor.controller");
const multer_1 = require("../../lib/multer");
const checkAuth_1 = require("../../middlewares/checkAuth");
const enums_1 = require("../../../generated/prisma/enums");
const router = (0, express_1.Router)();
router.post("/apply-as-doctor", multer_1.upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "additionalFiles", maxCount: 10 },
]), doctor_controller_1.doctorControllers.applyAsDoctor);
router.post("/apply-as-doctor/verify-email", doctor_controller_1.doctorControllers.verifyDoctorEmail);
router.post("/approve-doctor", (0, checkAuth_1.auth)(enums_1.Role.ADMIN, enums_1.Role.SUPER_ADMIN), doctor_controller_1.doctorControllers.approveDoctor);
router.get("/all-doctors", (0, checkAuth_1.auth)(enums_1.Role.ADMIN, enums_1.Role.SUPER_ADMIN), doctor_controller_1.doctorControllers.getAllDoctors);
exports.doctorRoutes = router;
//# sourceMappingURL=doctor.route.js.map