import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  dismissReminder,
} from '../controllers/reminder.controller';

const router = Router();
router.use(authenticate);

router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.put('/:id/dismiss', dismissReminder);

export default router;
