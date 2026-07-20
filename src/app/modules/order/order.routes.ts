import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate, authorizeAdmin } from "../../middleware/authenticate";

export const orderRoutes = Router();

// User routes (require login)
orderRoutes.post("/", authenticate, orderController.placeOrder);
orderRoutes.get("/my", authenticate, orderController.getMyOrders);

// Admin routes
orderRoutes.get("/", authenticate, authorizeAdmin, orderController.getAllOrders);
orderRoutes.get("/stats", authenticate, authorizeAdmin, orderController.getOrderStats);
orderRoutes.get("/:id", authenticate, authorizeAdmin, orderController.getOrderById);
orderRoutes.patch("/:id/approve", authenticate, authorizeAdmin, orderController.approveOrder);
orderRoutes.patch("/:id/reject", authenticate, authorizeAdmin, orderController.rejectOrder);
