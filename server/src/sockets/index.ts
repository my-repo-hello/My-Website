import { Server as SocketIOServer } from 'socket.io';
import { initializeChatSocket } from './chat.socket';
import { initializeNotificationSocket } from './notification.socket';

// Track online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initializeSockets = (io: SocketIOServer): void => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Auth handshake
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('user_online', { userId });
      console.log(`👤 User ${userId} is online`);
    }

    // Initialize feature sockets
    initializeChatSocket(io, socket, onlineUsers);
    initializeNotificationSocket(io, socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user_offline', { userId });
        console.log(`👤 User ${userId} is offline`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

export { onlineUsers };
