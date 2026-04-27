import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
} from '../controllers/note.controller';

const router = Router();
router.use(authenticate);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.put('/:id/pin', togglePin);

export default router;
