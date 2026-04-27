import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import Task from '../models/Task';
import Habit from '../models/Habit';
import Note from '../models/Note';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { displayName, bio, skills } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { displayName, bio, skills },
      { new: true }
    ).select('-password -refreshToken -otp');

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    ).select('-password -refreshToken -otp');

    res.json({ user, avatar: avatarPath });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAccountStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [tasksCompleted, habitsTracked, notesCreated] = await Promise.all([
      Task.countDocuments({ createdBy: req.user._id, status: 'completed' }),
      Habit.countDocuments({ userId: req.user._id }),
      Note.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      stats: {
        tasksCompleted,
        habitsTracked,
        notesCreated,
        memberSince: req.user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationPrefs, theme, timezone } = req.body;
    const updateData: any = {};
    
    if (notificationPrefs) updateData.notificationPrefs = notificationPrefs;
    if (theme) updateData.theme = theme;
    if (timezone) updateData.timezone = timezone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -refreshToken -otp');

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Incorrect password' });
      return;
    }

    await User.findByIdAndDelete(req.user._id);
    // TODO: Clean up user's data in other collections

    res.json({ message: 'Account deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find()
      .select('username displayName avatar role');
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
