import { Router } from "express";
import { upload } from "../../middleware/upload";
import { UploadController } from "./upload.controller";

const router = Router();

// Endpoint: POST /api/v1/upload
router.post("/", upload.single("file"), UploadController.uploadSingleImage);

// Endpoint: POST /api/v1/upload/single
router.post("/single", upload.single("file"), UploadController.uploadSingleImage);

export const uploadRoutes = router;
