import { Router } from 'express';
import {
  signup,
  login,
  refreshTokens,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  checkEmail,
  getMe,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshTokens);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/check-email/:email', checkEmail);
router.get('/me', authenticate, getMe);

export default router;
