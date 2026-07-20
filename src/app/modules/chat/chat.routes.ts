import { Router } from "express";
import * as chatController from "./chat.controller";
import { authenticate, authorizeAdmin } from "../../middleware/authenticate";

export const chatRoutes = Router();

// User routes
chatRoutes.get("/my-messages", authenticate, chatController.getMyMessagesWithAdmin);

// Admin routes
chatRoutes.get("/conversations", authenticate, authorizeAdmin, chatController.getAdminConversations);
chatRoutes.get("/messages/:userId", authenticate, authorizeAdmin, chatController.getMessagesWithUser);
