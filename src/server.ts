import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import { redisClient } from "./lib/redis";
import {
  seedSuperAdmin,
  seedTesterAdmin,
  seedTesterDoctor,
} from "./utils/seed";
import { transporter } from "./lib/nodemailer";
import { deleteUnverifiedDoctors } from "./lib/cron";

const PORT = config.port;

async function main() {
  try {
    prisma.$connect();
    console.log("database connected");

    await redisClient.connect();
    console.log("redis connected successfully");

    await transporter.verify();
    console.log("nodemailer is connected");

    seedSuperAdmin();
    seedTesterAdmin();
    seedTesterDoctor();

    await deleteUnverifiedDoctors();

    app.listen(PORT, () => {
      console.log(`Healthcare is connected on port ${PORT}`);
    });
  } catch (error) {
    console.log("database disconnected", error);
    prisma.$disconnect();

    process.exit();
  }
}

main();
