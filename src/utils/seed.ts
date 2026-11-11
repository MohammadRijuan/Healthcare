import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdmin = await prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
      },
    });

    if (isSuperAdmin) {
      console.log("super admin already exist");
      return;
    }

    const name = config.super_admin_name;
    const email = config.super_admin_email;
    const password = config.super_admin_password;

    if (!name || !email || !password) {
      throw new Error("Super Admin name,email,password missing in env file");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const superAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        emailVerified: true,
      },
    });

    console.log("super admin created : ", superAdmin);
  } catch (error) {
    console.log("Error Seeding Super Admin : ", error);

    await prisma.user.delete({
      where: {
        email: config.super_admin_email,
      },
    });
  }
};

export const seedTesterAdmin = async () => {
  try {
    const istesterAdmin = await prisma.user.findUnique({
      where: {
        email: config.tester_admin_email,
      },
    });

    if (istesterAdmin) {
      console.log("tester admin already exist");
      return;
    }

    const name = config.tester_admin_name;
    const email = config.tester_admin_email;
    const password = config.tester_admin_password;

    if (!name || !email || !password) {
      throw new Error("Tester Admin name,email,password missing in env file");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const testerAdmin = await prisma.user.create({
      data: {
        name,
        email,
        role: Role.ADMIN,
        needPasswordChange: false,
        emailVerified: true,
      },
    });
    console.log("tester admin created", testerAdmin);
  } catch (error) {
    console.log("Error Seeding tester Admin : ", error);

    await prisma.user.delete({
      where: {
        email: config.tester_admin_email,
      },
    });
  }
};

export const seedTesterDoctor = async () => {
  try {
    const isTesterDoctor = await prisma.user.findUnique({
      where: {
        email: config.tester_doctor_email,
      },
    });

    if (isTesterDoctor) {
      console.log("tester doctor is already exist");
      return;
    }

    const name = config.tester_doctor_name;
    const email = config.tester_doctor_email;
    const password = config.tester_doctor_password;

    if (!name || !email || !password) {
      throw new Error(
        "tester doctor name,email,password not exist in env file",
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const testerDoctor = await prisma.user.create({
      data: {
        name,
        email,
        role: Role.DOCTOR,
        needPasswordChange: true,
        emailVerified: true,
        doctor:{
          create:{
            email,
            name,
            experienceYears: 5,
            licenseNumber:"BMDC0000",
            qualifications:"MBBS",
            specialization:"Gynocologist"
          }
        }
      },
    });

    console.log("tester Doctor created successfully....", testerDoctor);
  } catch (error) {
    console.log("Error Seeding tester doctor: ", error);

    await prisma.user.delete({
      where: {
        email: config.tester_doctor_email,
      },
    });
  }
};
