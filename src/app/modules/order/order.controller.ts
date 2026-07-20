import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { placeOrderSchema } from "./order.validation";
import * as orderService from "./order.service";

export const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = placeOrderSchema.parse(req.body);
  const order = await orderService.placeOrder(userId, data);
  sendResponse(res, { success: true, statusCode: 201, message: "Order placed successfully. Awaiting payment confirmation.", data: order });
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const orders = await orderService.getMyOrders(userId);
  sendResponse(res, { success: true, statusCode: 200, message: "Your orders", data: orders });
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.query;
  const orders = await orderService.getAllOrders(status as string | undefined);
  sendResponse(res, { success: true, statusCode: 200, message: "All orders", data: orders });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Order detail", data: order });
});

export const approveOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.approveOrder(req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Order approved and links assigned", data: order });
});

export const rejectOrder = catchAsync(async (req: Request, res: Response) => {
  const { adminNote } = req.body;
  const order = await orderService.rejectOrder(req.params.id, adminNote);
  sendResponse(res, { success: true, statusCode: 200, message: "Order rejected", data: order });
});

export const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await orderService.getOrderStats();
  sendResponse(res, { success: true, statusCode: 200, message: "Order statistics", data: stats });
});
