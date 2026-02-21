const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");
const { PrismaClient } = require("@prisma/client");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

// userId -> socketId mapping
const onlineUsers = new Map();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    let currentUserId = null;

    socket.on("user:online", async (userId) => {
      currentUserId = userId;
      onlineUsers.set(userId, socket.id);

      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });

      const users = await prisma.user.findMany({
        where: { isOnline: true },
        select: { id: true, username: true },
      });
      io.emit("user:online", users);
    });

    socket.on("message:send", async ({ senderId, receiverId, content }) => {
      const message = await prisma.message.create({
        data: { content, senderId, receiverId },
        include: { sender: true, receiver: true },
      });

      // Send to sender for confirmation
      socket.emit("message:receive", message);

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:receive", message);
      }
    });

    socket.on("message:read", async ({ messageIds, readerId }) => {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          receiverId: readerId,
        },
        data: { read: true },
      });

      // Notify the sender that messages were read
      const messages = await prisma.message.findMany({
        where: { id: { in: messageIds } },
      });
      const senderIds = [...new Set(messages.map((m) => m.senderId))];
      for (const senderId of senderIds) {
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message:read", { messageIds, readerId });
        }
      }
    });

    socket.on("typing:start", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:start", { senderId });
      }
    });

    socket.on("typing:stop", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:stop", { senderId });
      }
    });

    socket.on("disconnect", async () => {
      if (currentUserId) {
        onlineUsers.delete(currentUserId);

        await prisma.user.update({
          where: { id: currentUserId },
          data: { isOnline: false },
        });

        const users = await prisma.user.findMany({
          where: { isOnline: true },
          select: { id: true, username: true },
        });
        io.emit("user:offline", users);
      }
    });
  });

  server.all("*", (req, res) => handle(req, res));

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
