import { Router } from "express";
import * as productController from "./product.controller";
import { authenticate, authorizeAdmin } from "../../middleware/authenticate";

export const productRoutes = Router();

// Public routes
productRoutes.get("/", productController.getPublishedProducts);
productRoutes.get("/:id", productController.getProductById);

// Admin routes
productRoutes.get("/admin/all", authenticate, authorizeAdmin, productController.getAllProductsAdmin);
productRoutes.post("/", authenticate, authorizeAdmin, productController.createProduct);
productRoutes.patch("/:id", authenticate, authorizeAdmin, productController.updateProduct);
productRoutes.patch("/:id/publish", authenticate, authorizeAdmin, productController.togglePublish);
productRoutes.delete("/:id", authenticate, authorizeAdmin, productController.deleteProduct);
