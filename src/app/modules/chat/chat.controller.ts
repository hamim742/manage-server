import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as chatService from "./chat.service";
import { prisma } from "../../lib/prisma";

export const getMyMessagesWithAdmin = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) {
    return sendResponse(res, { success: true, statusCode: 200, message: "Messages fetched", data: [] });
  }

  const messages = await chatService.getMessagesBetween(userId, admin.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Messages fetched", data: messages });
});

export const getMessagesWithUser = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req as any).user.id;
  const targetUserId = req.params.userId;

  const messages = await chatService.getMessagesBetween(adminId, targetUserId);
  await chatService.markMessagesAsRead(targetUserId, adminId);

  sendResponse(res, { success: true, statusCode: 200, message: "Messages fetched", data: messages });
});

export const getAdminConversations = catchAsync(async (req: Request, res: Response) => {
  const conversations = await chatService.getAdminConversations();
  sendResponse(res, { success: true, statusCode: 200, message: "Conversations fetched", data: conversations });
});
