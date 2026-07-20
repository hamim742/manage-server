import { Router } from "express";
import * as notificationController from "./notification.controller";
import { authenticate } from "../../middleware/authenticate";

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);

notificationRoutes.get("/", notificationController.getMyNotifications);
notificationRoutes.patch("/mark-all-read", notificationController.markAllAsRead);
notificationRoutes.patch("/:id/read", notificationController.markAsRead);
