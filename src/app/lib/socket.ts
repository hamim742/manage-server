import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { prisma } from "./prisma";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    // 1. Join room (user or admin)
    socket.on("join_room", ({ userId, role }: { userId?: string; role?: string }) => {
      if (role === "admin") {
        socket.join("admin_room");
      }
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // 2. Handle real-time chat message
    socket.on("send_message", async (data: { senderId: string; receiverId: string; message: string }) => {
      try {
        const { senderId, receiverId, message } = data;
        if (!senderId || !receiverId || !message.trim()) return;

        // Save message in DB
        const savedMessage = await prisma.chatMessage.create({
          data: {
            senderId,
            receiverId,
            message: message.trim(),
          },
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
        });

        // Emit message to receiver's room
        io.to(`user_${receiverId}`).emit("new_message", savedMessage);
        // Also emit to sender so their UI updates
        socket.emit("message_sent", savedMessage);

        // If message sent to admin, emit to admin_room
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (receiver?.role === "admin") {
          io.to("admin_room").emit("new_message", savedMessage);

          // Create Notification in DB for admin
          const notification = await prisma.notification.create({
            data: {
              userId: null,
              title: "New Customer Message 💬",
              message: `${savedMessage.sender.name}: ${message.trim().slice(0, 50)}...`,
              type: "CHAT_MESSAGE",
              linkUrl: "/dashboard/chat",
            },
          });
          io.to("admin_room").emit("new_notification", notification);
        }
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    socket.on("disconnect", () => {
      // Clean up connection
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
