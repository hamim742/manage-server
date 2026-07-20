import { prisma } from "../lib/prisma";
import { seedAdmin } from "./seedAdmin";

export const connectedDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    await seedAdmin();
  } catch (error) {
    console.log("❌ Database connection error:", error);
    process.exit(1);
  }
};
