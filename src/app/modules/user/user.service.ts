import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import config from "../../../config";

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateProfile = async (
  userId: string,
  data: { name?: string }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error: any = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, config.password_salt);
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
    select: { id: true, email: true },
  });
};

export const updateUserStatus = async (userId: string, status: "active" | "inactive" | "blocked") => {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });
};
