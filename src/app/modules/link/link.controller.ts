import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as linkService from "./link.service";
import { z } from "zod";

const bulkAddSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  urls: z.array(z.string()).min(1, "At least one URL is required"),
});

export const bulkAddLinks = catchAsync(async (req: Request, res: Response) => {
  const { productId, urls } = bulkAddSchema.parse(req.body);
  const result = await linkService.bulkAddLinks(productId, urls);
  sendResponse(res, { success: true, statusCode: 201, message: `${result.added} links added`, data: result });
});

export const getLinksByProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.query;
  if (!productId || typeof productId !== "string") {
    return res.status(400).json({ success: false, message: "productId query param is required" });
  }
  const links = await linkService.getLinksByProduct(productId);
  sendResponse(res, { success: true, statusCode: 200, message: "Links fetched", data: links });
});

export const deleteLink = catchAsync(async (req: Request, res: Response) => {
  await linkService.deleteLink(req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Link deleted", data: null });
});

export const deleteAllUnusedLinks = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.query;
  if (!productId || typeof productId !== "string") {
    return res.status(400).json({ success: false, message: "productId query param is required" });
  }
  const result = await linkService.deleteAllUnusedLinks(productId);
  sendResponse(res, { success: true, statusCode: 200, message: `${result.deleted} links deleted`, data: result });
});

const deleteSelectedSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one link ID is required"),
});

export const deleteSelectedLinks = catchAsync(async (req: Request, res: Response) => {
  const { ids } = deleteSelectedSchema.parse(req.body);
  const result = await linkService.deleteSelectedLinks(ids);
  sendResponse(res, { success: true, statusCode: 200, message: `${result.deleted} links deleted`, data: result });
});

