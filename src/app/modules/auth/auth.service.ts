import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import config from "../../../config";
import { RegisterInput, LoginInput } from "./auth.validation";

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const error: any = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(data.password, config.password_salt);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "blocked") {
    const error: any = new Error("Your account has been blocked");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expire_in } as any
  );

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};
