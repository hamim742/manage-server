import { Router } from "express";
import * as paymentController from "./payment.controller";
import { authenticate, authorizeAdmin } from "../../middleware/authenticate";

export const paymentRoutes = Router();

// Public: users need to see payment info when checking out
paymentRoutes.get("/", paymentController.getPaymentSettings);

// Admin only
paymentRoutes.get("/all", authenticate, authorizeAdmin, paymentController.getAllPaymentSettings);
paymentRoutes.post("/", authenticate, authorizeAdmin, paymentController.createPaymentSetting);
paymentRoutes.patch("/:id", authenticate, authorizeAdmin, paymentController.updatePaymentSetting);
paymentRoutes.delete("/:id", authenticate, authorizeAdmin, paymentController.deletePaymentSetting);
