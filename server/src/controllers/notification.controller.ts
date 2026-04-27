import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Notification from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
