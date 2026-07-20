import { prisma } from "../../lib/prisma";

export const getMessagesBetween = async (userId1: string, userId2: string) => {
  return prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });
};

export const getAdminConversations = async () => {
  // Find all distinct users who sent messages or received messages
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
      receiver: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  const conversationsMap = new Map<string, any>();

  for (const msg of messages) {
    const customer = msg.sender.role !== "admin" ? msg.sender : msg.receiver;
    if (customer.role === "admin") continue;

    if (!conversationsMap.has(customer.id)) {
      conversationsMap.set(customer.id, {
        customer,
        lastMessage: msg.message,
        lastMessageAt: msg.createdAt,
        unreadCount: 0,
      });
    }

    if (!msg.isRead && msg.receiver.role === "admin" && msg.senderId === customer.id) {
      const conv = conversationsMap.get(customer.id);
      conv.unreadCount += 1;
    }
  }

  return Array.from(conversationsMap.values());
};

export const markMessagesAsRead = async (senderId: string, receiverId: string) => {
  return prisma.chatMessage.updateMany({
    where: {
      senderId,
      receiverId,
      isRead: false,
    },
    data: { isRead: true },
  });
};
