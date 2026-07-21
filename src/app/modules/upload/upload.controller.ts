import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UploadService } from "./upload.service";

export const uploadSingleImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error("No image file uploaded!");
  }

  const imageName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
  const result = await UploadService.sendImageToStorage(imageName, req.file.buffer);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Image uploaded successfully!",
    data: {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    },
  });
});

export const UploadController = {
  uploadSingleImage,
};
