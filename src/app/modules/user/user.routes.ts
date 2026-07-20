import { Router } from "express";
import * as userController from "./user.controller";
import { authenticate, authorizeAdmin } from "../../middleware/authenticate";

export const userRoutes = Router();

// User routes
userRoutes.patch("/profile", authenticate, userController.updateProfile);
userRoutes.patch("/change-password", authenticate, userController.changePassword);

// Admin routes
userRoutes.get("/", authenticate, authorizeAdmin, userController.getAllUsers);
userRoutes.patch("/:id/status", authenticate, authorizeAdmin, userController.updateUserStatus);
