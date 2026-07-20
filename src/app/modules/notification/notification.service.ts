import { prisma } from "../../lib/prisma";

export const getNotifications = async (userId?: string) => {
  const where = userId ? { userId } : { userId: null };
  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unreadCount = await prisma.notification.count({
    where: { ...where, isRead: false },
  });

  return { notifications, unreadCount };
};

export const markNotificationAsRead = async (id: string) => {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId?: string) => {
  const where = userId ? { userId } : { userId: null };
  return prisma.notification.updateMany({
    where: { ...where, isRead: false },
    data: { isRead: true },
  });
};
