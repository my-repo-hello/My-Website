import { Server as SocketIOServer, Socket } from 'socket.io';

export const initializeNotificationSocket = (
  io: SocketIOServer,
  socket: Socket
): void => {
  const userId = socket.handshake.query.userId as string;
  
  if (userId) {
    // Join personal notification room
    socket.join(`user:${userId}`);
  }
};

// Helper to send notification to specific user
export const sendNotificationToUser = (
  io: SocketIOServer,
  userId: string,
  notification: any
): void => {
  io.to(`user:${userId}`).emit('notification', notification);
};
