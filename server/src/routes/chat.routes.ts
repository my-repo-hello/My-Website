import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadChat } from '../middleware/upload';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  uploadChatFile,
  getUsers,
} from '../controllers/chat.controller';

const router = Router();
router.use(authenticate);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/upload', uploadChat.single('file'), uploadChatFile);
router.get('/users', getUsers);

export default router;
