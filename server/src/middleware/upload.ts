import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const dirs = ['uploads/avatars', 'uploads/chat', 'uploads/general'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/general');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const chatStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/chat');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext || mime) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

export const uploadGeneral = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadAvatar = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadChat = multer({ storage: chatStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
