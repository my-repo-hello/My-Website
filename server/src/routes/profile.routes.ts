import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadAvatar } from '../middleware/upload';
import {
  getProfile,
  updateProfile,
  uploadAvatar as uploadAvatarHandler,
  changePassword,
  getAccountStats,
  updateSettings,
  deleteAccount,
  getAllUsers,
} from '../controllers/profile.controller';

const router = Router();
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', uploadAvatar.single('avatar'), uploadAvatarHandler);
router.put('/password', changePassword);
router.get('/stats', getAccountStats);
router.put('/settings', updateSettings);
router.delete('/account', deleteAccount);
router.get('/users', getAllUsers);

export default router;
