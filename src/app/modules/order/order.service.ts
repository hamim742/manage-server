import { prisma } from "../../lib/prisma";
import { PlaceOrderInput } from "./order.validation";
import { getIO } from "../../lib/socket";

// User places an order
export const placeOrder = async (userId: string, data: PlaceOrderInput) => {
  const { productId, quantity, transactionId, senderNumber, amountPaid, paymentMethod } = data;

  // Check product exists and is published
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isPublished) {
    const error: any = new Error("Product not found or not available");
    error.statusCode = 404;
    throw error;
  }

  // Check available links
  const availableLinks = await prisma.link.count({
    where: { productId, isUsed: false },
  });

  if (availableLinks < quantity) {
    const error: any = new Error(`Only ${availableLinks} items available in stock`);
    error.statusCode = 400;
    throw error;
  }

  // Create the order (links will be assigned on approval)
  const order = await prisma.order.create({
    data: {
      userId,
      productId,
      quantity,
      totalAmount: product.price * quantity,
      transactionId,
      senderNumber,
      amountPaid,
      paymentMethod,
    },
    include: {
      product: { select: { id: true, title: true, price: true, thumbnail: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Create Notification in DB for Admin
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: null, // Admin
        title: "🛒 New Order Received!",
        message: `${order.user.name} ordered ${quantity}x ${order.product.title} (৳${order.totalAmount}) via ${paymentMethod}`,
        type: "NEW_ORDER",
        linkUrl: "/dashboard/orders",
      },
    });

    // Real-time broadcast to Admin Room
    const io = getIO();
    io.to("admin_room").emit("new_order", { order, notification });
    io.to("admin_room").emit("new_notification", notification);
  } catch (socketErr) {
    console.error("Socket emit error on placeOrder:", socketErr);
  }

  return order;
};

// User: get their own orders
export const getMyOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      product: { select: { id: true, title: true, thumbnail: true } },
      links: { select: { id: true, url: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Admin: get all orders with filters
export const getAllOrders = async (status?: string) => {
  return prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      product: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
      links: { select: { id: true, url: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Admin: get single order detail
export const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      product: true,
      user: { select: { id: true, name: true, email: true } },
      links: true,
    },
  });
  if (!order) {
    const error: any = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  return order;
};

// Admin: approve order — assign links
export const approveOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { links: true },
  });

  if (!order) {
    const error: any = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== "PENDING") {
    const error: any = new Error(`Order is already ${order.status}`);
    error.statusCode = 400;
    throw error;
  }

  // Pick available links for this product
  const availableLinks = await prisma.link.findMany({
    where: { productId: order.productId, isUsed: false },
    take: order.quantity,
  });

  if (availableLinks.length < order.quantity) {
    const error: any = new Error(
      `Not enough links in stock. Available: ${availableLinks.length}, required: ${order.quantity}`
    );
    error.statusCode = 400;
    throw error;
  }

  const linkIds = availableLinks.map((l) => l.id);

  // Atomic transaction: mark order approved + links as used
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Mark links as used and associate with order
    await tx.link.updateMany({
      where: { id: { in: linkIds } },
      data: { isUsed: true, orderId },
    });

    // Update order status
    return tx.order.update({
      where: { id: orderId },
      data: { status: "APPROVED" },
      include: {
        links: { select: { id: true, url: true } },
        product: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  });

  // Notify User
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: updatedOrder.userId,
        title: "🎉 Order Approved!",
        message: `Your order for ${updatedOrder.product.title} has been approved. Links are now available in My Orders!`,
        type: "ORDER_STATUS",
        linkUrl: "/orders",
      },
    });

    const io = getIO();
    io.to(`user_${updatedOrder.userId}`).emit("order_updated", updatedOrder);
    io.to(`user_${updatedOrder.userId}`).emit("new_notification", notification);
  } catch (err) {
    console.error("Socket emit error on approveOrder:", err);
  }

  return updatedOrder;
};

// Admin: reject order
export const rejectOrder = async (orderId: string, adminNote?: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    const error: any = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  if (order.status !== "PENDING") {
    const error: any = new Error(`Order is already ${order.status}`);
    error.statusCode = 400;
    throw error;
  }

  const rejectedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: "REJECTED", adminNote },
    include: { product: { select: { title: true } } },
  });

  // Notify User
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: rejectedOrder.userId,
        title: "❌ Order Rejected",
        message: `Your order for ${rejectedOrder.product.title} was rejected. ${adminNote ? `Reason: ${adminNote}` : ""}`,
        type: "ORDER_STATUS",
        linkUrl: "/orders",
      },
    });

    const io = getIO();
    io.to(`user_${rejectedOrder.userId}`).emit("order_updated", rejectedOrder);
    io.to(`user_${rejectedOrder.userId}`).emit("new_notification", notification);
  } catch (err) {
    console.error("Socket emit error on rejectOrder:", err);
  }

  return rejectedOrder;
};

// Admin: stats summary
export const getOrderStats = async () => {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "APPROVED" } }),
    prisma.order.count({ where: { status: "REJECTED" } }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    where: { status: "APPROVED" },
    _sum: { totalAmount: true },
  });

  return {
    total,
    pending,
    approved,
    rejected,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
  };
};
