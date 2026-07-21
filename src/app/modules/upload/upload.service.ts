import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "../../../config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Uploads an image buffer or file stream to Cloudinary (Storage Provider).
 * Designed modularly so you can easily switch the implementation to AWS S3 or GCP in the future!
 */
export const sendImageToStorage = async (
  imageName: string,
  buffer: Buffer
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: imageName.replace(/\.[^/.]+$/, ""),
        folder: "basione-products",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result) {
          return resolve(result);
        }
        reject(new Error("Unknown Cloudinary upload error"));
      }
    );

    uploadStream.end(buffer);
  });
};

export const UploadService = {
  sendImageToStorage,
};
