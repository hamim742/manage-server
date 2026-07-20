import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { registerSchema, loginSchema } from "./auth.validation";
import * as authService from "./auth.service";

export const register = catchAsync(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const user = await authService.registerUser(data);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Registration successful",
    data: user,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await authService.loginUser(data);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: { user: result.user, token: result.token },
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getMe((req as any).user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User fetched successfully",
    data: user,
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("token");
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Logged out successfully",
    data: null,
  });
});
