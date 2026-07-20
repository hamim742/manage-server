import { prisma } from "../../lib/prisma";
import { PlaceOrderInput } from "./order.validation";

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
    },
  });

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

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "REJECTED", adminNote },
  });
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
