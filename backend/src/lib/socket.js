import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = ["https://finalchat-lked.vercel.app", "https://finalchat-7zx7.onrender.com", "https://finalchat-ui.onrender.com"];
      if (!origin || origin.startsWith("http://localhost") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Broadcast online users only to this user (not to all)
  socket.emit("getOnlineUsers", Object.keys(userSocketMap));
  
  // Notify only relevant users about this user coming online
  socket.broadcast.emit("userOnline", userId);

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    // Notify others this user went offline
    socket.broadcast.emit("userOffline", userId);
  });
});

export { io, app, server };
