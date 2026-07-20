import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as paymentService from "./payment.service";
import { z } from "zod";

const createSchema = z.object({
  method: z.string().min(1, "Method is required"),
  number: z.string().min(1, "Number is required"),
  qrImageUrl: z.string().url().optional(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const getPaymentSettings = catchAsync(async (req: Request, res: Response) => {
  const settings = await paymentService.getPaymentSettings();
  sendResponse(res, { success: true, statusCode: 200, message: "Payment settings", data: settings });
});

export const getAllPaymentSettings = catchAsync(async (req: Request, res: Response) => {
  const settings = await paymentService.getAllPaymentSettings();
  sendResponse(res, { success: true, statusCode: 200, message: "All payment settings", data: settings });
});

export const createPaymentSetting = catchAsync(async (req: Request, res: Response) => {
  const data = createSchema.parse(req.body);
  const setting = await paymentService.createPaymentSetting(data);
  sendResponse(res, { success: true, statusCode: 201, message: "Payment setting created", data: setting });
});

export const updatePaymentSetting = catchAsync(async (req: Request, res: Response) => {
  const data = updateSchema.parse(req.body);
  const setting = await paymentService.updatePaymentSetting(req.params.id, data);
  sendResponse(res, { success: true, statusCode: 200, message: "Payment setting updated", data: setting });
});

export const deletePaymentSetting = catchAsync(async (req: Request, res: Response) => {
  await paymentService.deletePaymentSetting(req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Payment setting deleted", data: null });
});
