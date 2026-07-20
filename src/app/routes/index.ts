import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { productRoutes } from "../modules/product/product.routes";
import { linkRoutes } from "../modules/link/link.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { userRoutes } from "../modules/user/user.routes";
import { chatRoutes } from "../modules/chat/chat.routes";
import { notificationRoutes } from "../modules/notification/notification.routes";

export const router = Router();

const routes = [
  { path: "/auth", route: authRoutes },
  { path: "/products", route: productRoutes },
  { path: "/links", route: linkRoutes },
  { path: "/orders", route: orderRoutes },
  { path: "/payment-settings", route: paymentRoutes },
  { path: "/users", route: userRoutes },
  { path: "/chat", route: chatRoutes },
  { path: "/notifications", route: notificationRoutes },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});
