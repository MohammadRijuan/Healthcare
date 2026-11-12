"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const enums_1 = require("../../../generated/prisma/enums");
const multer_1 = require("../../lib/multer");
const router = (0, express_1.Router)();
router.patch("/profile-image", (0, checkAuth_1.auth)(enums_1.Role.ADMIN, enums_1.Role.SUPER_ADMIN, enums_1.Role.PATIENT, enums_1.Role.DOCTOR), multer_1.upload.single("profileImage"));
exports.userRoutes = router;
//# sourceMappingURL=user.route.js.map