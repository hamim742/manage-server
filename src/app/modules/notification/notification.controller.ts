import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as notificationService from "./notification.service";

export const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.role === "admin" ? undefined : user.id;
  const result = await notificationService.getNotifications(userId);
  sendResponse(res, { success: true, statusCode: 200, message: "Notifications fetched", data: result });
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const notification = await notificationService.markNotificationAsRead(req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Marked as read", data: notification });
});

export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.role === "admin" ? undefined : user.id;
  await notificationService.markAllAsRead(userId);
  sendResponse(res, { success: true, statusCode: 200, message: "All marked as read", data: null });
});
