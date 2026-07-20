import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import config from "../../config";

export const seedAdmin = async () => {
  try {
    const isExistAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (isExistAdmin) {
      console.log("👤 Admin user already exists in database.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.admin.password,
      config.password_salt
    );

    const admin = await prisma.user.create({
      data: {
        name: config.admin.name,
        email: config.admin.email,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      },
    });

    console.log("=========================================");
    console.log("👑 Default Admin Created Successfully!");
    console.log(`📧 Email:    ${admin.email}`);
    console.log(`🔑 Password: ${config.admin.password}`);
    console.log("=========================================");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
};
