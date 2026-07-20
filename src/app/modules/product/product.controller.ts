import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { createProductSchema, updateProductSchema } from "./product.validation";
import * as productService from "./product.service";

export const getPublishedProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await productService.getPublishedProducts();
  sendResponse(res, { success: true, statusCode: 200, message: "Products fetched", data: products });
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Product fetched", data: product });
});

export const getAllProductsAdmin = catchAsync(async (req: Request, res: Response) => {
  const products = await productService.getAllProducts();
  sendResponse(res, { success: true, statusCode: 200, message: "Products fetched", data: products });
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const data = createProductSchema.parse(req.body);
  const product = await productService.createProduct(data);
  sendResponse(res, { success: true, statusCode: 201, message: "Product created", data: product });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const data = updateProductSchema.parse(req.body);
  const product = await productService.updateProduct(req.params.id, data);
  sendResponse(res, { success: true, statusCode: 200, message: "Product updated", data: product });
});

export const togglePublish = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.togglePublish(req.params.id);
  sendResponse(res, {
    success: true, statusCode: 200,
    message: product.isPublished ? "Product published" : "Product unpublished",
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Product deleted", data: null });
});
