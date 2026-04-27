import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Note from '../models/Note';

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, filter, tag } = req.query;
    
    let query: any = {};
    
    if (filter === 'personal') {
      query = { userId: req.user._id, isShared: false };
    } else if (filter === 'shared') {
      query = { isShared: true };
    } else {
      query = { $or: [{ userId: req.user._id }, { isShared: true }] };
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const notes = await Note.find(query)
      .populate('userId', 'username displayName avatar')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({ notes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = new Note({
      ...req.body,
      userId: req.user._id,
    });
    await note.save();
    res.status(201).json({ note, message: 'Note created' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    res.json({ note });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Note deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    note.isPinned = !note.isPinned;
    await note.save();
    res.json({ note });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
