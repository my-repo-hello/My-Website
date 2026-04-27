import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Reminder from '../models/Reminder';

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const reminders = await Reminder.find({ userId: req.user._id })
      .populate('linkedTask', 'title status')
      .sort({ datetime: 1 });

    const grouped = {
      today: reminders.filter(r => r.datetime >= todayStart && r.datetime < todayEnd),
      upcoming: reminders.filter(r => r.datetime >= todayEnd && r.status === 'active'),
      past: reminders.filter(r => r.datetime < todayStart || r.status !== 'active'),
    };

    res.json({ reminders: grouped, all: reminders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = new Reminder({
      ...req.body,
      userId: req.user._id,
    });
    await reminder.save();
    res.status(201).json({ reminder, message: 'Reminder created' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) {
      res.status(404).json({ message: 'Reminder not found' });
      return;
    }
    res.json({ reminder });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Reminder deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const dismissReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'dismissed' },
      { new: true }
    );
    if (!reminder) {
      res.status(404).json({ message: 'Reminder not found' });
      return;
    }
    res.json({ reminder });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
