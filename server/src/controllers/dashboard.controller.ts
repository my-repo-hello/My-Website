import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Task from '../models/Task';
import Habit from '../models/Habit';
import HabitLog from '../models/HabitLog';
import Reminder from '../models/Reminder';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // 1. Habit Progress
    const habits = await Habit.find({ userId });
    const todayLogs = await HabitLog.find({ userId, date: today, status: 'completed' });
    const habitProgress = {
      completed: todayLogs.length,
      total: habits.length,
      percentage: habits.length > 0 ? Math.round((todayLogs.length / habits.length) * 100) : 0,
    };

    // 2. Pending Tasks
    const tasks = await Task.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }],
      status: { $ne: 'completed' },
    });
    const pendingTasks = {
      total: tasks.length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    // 3. Recent Messages
    const userConversations = await Conversation.find({ members: userId });
    const convIds = userConversations.map(c => c._id);
    const recentMessages = await Message.find({ conversationId: { $in: convIds } })
      .populate('senderId', 'username displayName avatar')
      .sort({ timestamp: -1 })
      .limit(3);

    // 4. Upcoming Reminders
    const upcomingReminders = await Reminder.find({
      userId,
      datetime: { $gte: now },
      status: 'active',
    })
      .sort({ datetime: 1 })
      .limit(3);

    // 5. Weekly productivity chart data
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const completedTasks = await Task.countDocuments({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
        status: 'completed',
        updatedAt: { $gte: dayStart, $lt: dayEnd },
      });

      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dayStr,
        tasksCompleted: completedTasks,
      });
    }

    // 6. Habit streak leaderboard
    const topHabits = await Habit.find({ userId })
      .sort({ currentStreak: -1 })
      .limit(3);

    res.json({
      habitProgress,
      pendingTasks,
      recentMessages,
      upcomingReminders,
      weeklyChart: weekData,
      habitLeaderboard: topHabits,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
