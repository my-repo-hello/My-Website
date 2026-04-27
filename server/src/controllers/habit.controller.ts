import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Habit from '../models/Habit';
import HabitLog from '../models/HabitLog';

export const getHabits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's logs
    const todayLogs = await HabitLog.find({
      userId: req.user._id,
      date: today,
    });
    
    const habitsWithStatus = habits.map(habit => {
      const log = todayLogs.find(l => l.habitId.toString() === habit._id.toString());
      return {
        ...habit.toJSON(),
        todayStatus: log?.status || 'pending',
      };
    });

    res.json({ habits: habitsWithStatus });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = new Habit({
      ...req.body,
      userId: req.user._id,
    });
    await habit.save();
    res.status(201).json({ habit, message: 'Habit created' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!habit) {
      res.status(404).json({ message: 'Habit not found' });
      return;
    }
    res.json({ habit });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    await HabitLog.deleteMany({ habitId: req.params.id });
    res.json({ message: 'Habit deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleHabitLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const habit = await Habit.findOne({ _id: id, userId: req.user._id });
    if (!habit) {
      res.status(404).json({ message: 'Habit not found' });
      return;
    }

    let log = await HabitLog.findOne({ habitId: id, date: today });
    
    if (log) {
      log.status = log.status === 'completed' ? 'pending' : 'completed';
      await log.save();
    } else {
      log = new HabitLog({
        habitId: id,
        userId: req.user._id,
        date: today,
        status: 'completed',
      });
      await log.save();
    }

    // Update streak
    await updateStreak(habit);

    res.json({ log, habit: await Habit.findById(id) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const updateStreak = async (habit: any): Promise<void> => {
  const logs = await HabitLog.find({
    habitId: habit._id,
    status: 'completed',
  }).sort({ date: -1 });

  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (logDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++;
    } else {
      break;
    }
  }

  habit.currentStreak = streak;
  if (streak > habit.longestStreak) {
    habit.longestStreak = streak;
  }
  await habit.save();
};

export const getCalendarData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month } = req.params; // YYYY-MM
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const logs = await HabitLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).populate('habitId', 'name color');

    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHabitAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.user._id });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await Promise.all(
      habits.map(async (habit) => {
        const logs = await HabitLog.find({
          habitId: habit._id,
          date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] },
        });

        const completed = logs.filter(l => l.status === 'completed').length;
        const total = logs.length || 1;

        return {
          habitId: habit._id,
          name: habit.name,
          color: habit.color,
          currentStreak: habit.currentStreak,
          longestStreak: habit.longestStreak,
          completionRate: Math.round((completed / total) * 100),
          logs,
        };
      })
    );

    res.json({ analytics });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
