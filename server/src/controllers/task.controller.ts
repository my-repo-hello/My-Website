import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Task from '../models/Task';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, assignee, search, dueDateFrom, dueDateTo } = req.query;
    
    const filter: any = {
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id },
      ],
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignedTo = assignee;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom as string);
      if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo as string);
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'username displayName avatar')
      .populate('createdBy', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar')
      .populate('activityLog.user', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user._id,
      activityLog: [
        {
          user: req.user._id,
          action: 'created this task',
          timestamp: new Date(),
        },
      ],
    });
    await task.save();
    
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'username displayName avatar')
      .populate('createdBy', 'username displayName avatar');

    res.status(201).json({ task: populated, message: 'Task created' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username displayName avatar')
      .populate('createdBy', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar')
      .populate('activityLog.user', 'username displayName avatar');

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ task });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Log status changes
    if (req.body.status && req.body.status !== task.status) {
      task.activityLog.push({
        user: req.user._id,
        action: `changed status to ${req.body.status}`,
        timestamp: new Date(),
      });
    }

    Object.assign(task, req.body);
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'username displayName avatar')
      .populate('createdBy', 'username displayName avatar');

    res.json({ task: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.comments.push({
      user: req.user._id,
      text: req.body.text,
      createdAt: new Date(),
    });

    task.activityLog.push({
      user: req.user._id,
      action: 'added a comment',
      timestamp: new Date(),
    });

    await task.save();
    
    const populated = await Task.findById(task._id)
      .populate('comments.user', 'username displayName avatar');

    res.json({ task: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.activityLog.push({
      user: req.user._id,
      action: `changed status from ${task.status} to ${status}`,
      timestamp: new Date(),
    });

    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'username displayName avatar')
      .populate('createdBy', 'username displayName avatar');

    res.json({ task: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
