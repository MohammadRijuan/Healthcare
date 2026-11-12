"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const prisma_1 = require("./lib/prisma");
const redis_1 = require("./lib/redis");
const seed_1 = require("./utils/seed");
const nodemailer_1 = require("./lib/nodemailer");
const cron_1 = require("./lib/cron");
const PORT = config_1.default.port;
async function main() {
    try {
        prisma_1.prisma.$connect();
        console.log("database connected");
        await redis_1.redisClient.connect();
        console.log("redis connected successfully");
        await nodemailer_1.transporter.verify();
        console.log("nodemailer is connected");
        (0, seed_1.seedSuperAdmin)();
        (0, seed_1.seedTesterAdmin)();
        (0, seed_1.seedTesterDoctor)();
        await (0, cron_1.deleteUnverifiedDoctors)();
        app_1.default.listen(PORT, () => {
            console.log(`Healthcare is connected on port ${PORT}`);
        });
    }
    catch (error) {
        console.log("database disconnected", error);
        prisma_1.prisma.$disconnect();
        process.exit();
    }
}
main();
//# sourceMappingURL=server.js.map