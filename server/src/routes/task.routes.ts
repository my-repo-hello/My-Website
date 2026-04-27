import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  updateTaskStatus,
} from '../controllers/task.controller';

const router = Router();
router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);
router.put('/:id/status', updateTaskStatus);

export default router;
