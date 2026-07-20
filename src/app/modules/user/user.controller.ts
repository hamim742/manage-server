import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as userService from "./user.service";
import { z } from "zod";

const updateProfileSchema = z.object({ name: z.string().min(2).optional() });
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  sendResponse(res, { success: true, statusCode: 200, message: "Users fetched", data: users });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = updateProfileSchema.parse(req.body);
  const user = await userService.updateProfile(userId, data);
  sendResponse(res, { success: true, statusCode: 200, message: "Profile updated", data: user });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const result = await userService.changePassword(userId, currentPassword, newPassword);
  sendResponse(res, { success: true, statusCode: 200, message: "Password changed successfully", data: result });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const user = await userService.updateUserStatus(req.params.id, status);
  sendResponse(res, { success: true, statusCode: 200, message: "User status updated", data: user });
});
