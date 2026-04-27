import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitLog,
  getCalendarData,
  getHabitAnalytics,
} from '../controllers/habit.controller';

const router = Router();
router.use(authenticate);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/log', toggleHabitLog);
router.get('/calendar/:month', getCalendarData);
router.get('/analytics', getHabitAnalytics);

export default router;
