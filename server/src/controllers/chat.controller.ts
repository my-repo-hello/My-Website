import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await Conversation.find({
      members: req.user._id,
    })
      .populate('members', 'username displayName avatar')
      .populate('lastMessage.senderId', 'username displayName')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.user._id },
          seenBy: { $ne: req.user._id },
        });
        return { ...conv.toJSON(), unreadCount };
      })
    );

    res.json({ conversations: conversationsWithUnread });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, members, name } = req.body;
    
    // For private DMs, check if conversation already exists
    if (type === 'private' && members.length === 1) {
      const existingConv = await Conversation.findOne({
        type: 'private',
        members: { $all: [req.user._id, members[0]], $size: 2 },
      }).populate('members', 'username displayName avatar');

      if (existingConv) {
        res.json({ conversation: existingConv });
        return;
      }
    }

    const conversation = new Conversation({
      type,
      members: [req.user._id, ...members],
      name: type === 'group' ? name : '',
    });

    await conversation.save();
    const populated = await Conversation.findById(conversation._id)
      .populate('members', 'username displayName avatar');

    res.status(201).json({ conversation: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'username displayName avatar')
      .populate('replyTo')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId: id });

    res.json({
      messages: messages.reverse(),
      total,
      hasMore: page * limit < total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, content, type, replyTo } = req.body;

    const message = new Message({
      senderId: req.user._id,
      conversationId,
      content,
      type: type || 'text',
      replyTo,
      deliveredTo: [req.user._id],
      seenBy: [req.user._id],
    });

    await message.save();

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content,
        senderId: req.user._id,
        timestamp: new Date(),
      },
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'username displayName avatar')
      .populate('replyTo');

    res.status(201).json({ message: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadChatFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(req.file.originalname);

    res.json({
      fileUrl,
      fileName: req.file.originalname,
      type: isImage ? 'image' : 'file',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username displayName avatar');
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
