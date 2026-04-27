import { Server as SocketIOServer, Socket } from 'socket.io';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

export const initializeChatSocket = (
  io: SocketIOServer,
  socket: Socket,
  onlineUsers: Map<string, string>
): void => {
  // Join conversation rooms
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
  });

  // Leave conversation
  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data: {
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
    fileUrl?: string;
    fileName?: string;
    replyTo?: string;
  }) => {
    try {
      const message = new Message({
        senderId: data.senderId,
        conversationId: data.conversationId,
        content: data.content,
        type: data.type || 'text',
        fileUrl: data.fileUrl || '',
        fileName: data.fileName || '',
        replyTo: data.replyTo || undefined,
        deliveredTo: [data.senderId],
        seenBy: [data.senderId],
      });

      await message.save();

      // Update conversation last message
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: {
          content: data.content || (data.type === 'image' ? '📷 Image' : '📎 File'),
          senderId: data.senderId,
          timestamp: new Date(),
        },
      });

      const populated = await Message.findById(message._id)
        .populate('senderId', 'username displayName avatar')
        .populate('replyTo');

      // Emit to conversation room
      io.to(`conv:${data.conversationId}`).emit('receive_message', populated);

      // Deliver to offline members
      const conv = await Conversation.findById(data.conversationId);
      if (conv) {
        conv.members.forEach((memberId) => {
          const memberStr = memberId.toString();
          if (memberStr !== data.senderId) {
            const memberSocketId = onlineUsers.get(memberStr);
            if (memberSocketId) {
              io.to(memberSocketId).emit('new_message_notification', {
                conversationId: data.conversationId,
                message: populated,
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Socket send_message error:', error);
    }
  });

  // Typing indicators
  socket.on('typing_start', (data: { conversationId: string; userId: string; username: string }) => {
    socket.to(`conv:${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
      username: data.username,
      conversationId: data.conversationId,
    });
  });

  socket.on('typing_stop', (data: { conversationId: string; userId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit('user_stop_typing', {
      userId: data.userId,
      conversationId: data.conversationId,
    });
  });

  // Mark messages as seen
  socket.on('mark_seen', async (data: { conversationId: string; userId: string }) => {
    try {
      await Message.updateMany(
        {
          conversationId: data.conversationId,
          senderId: { $ne: data.userId },
          seenBy: { $ne: data.userId },
        },
        { $addToSet: { seenBy: data.userId } }
      );

      io.to(`conv:${data.conversationId}`).emit('message_seen', {
        conversationId: data.conversationId,
        userId: data.userId,
      });
    } catch (error) {
      console.error('Socket mark_seen error:', error);
    }
  });

  // Emoji reaction
  socket.on('add_reaction', async (data: { messageId: string; emoji: string; userId: string; conversationId: string }) => {
    try {
      const message = await Message.findById(data.messageId);
      if (message) {
        const existingReaction = message.reactions.find(
          r => r.userId.toString() === data.userId && r.emoji === data.emoji
        );

        if (existingReaction) {
          message.reactions = message.reactions.filter(
            r => !(r.userId.toString() === data.userId && r.emoji === data.emoji)
          );
        } else {
          message.reactions.push({ emoji: data.emoji, userId: data.userId as any });
        }

        await message.save();
        io.to(`conv:${data.conversationId}`).emit('reaction_updated', {
          messageId: data.messageId,
          reactions: message.reactions,
        });
      }
    } catch (error) {
      console.error('Socket add_reaction error:', error);
    }
  });
};
