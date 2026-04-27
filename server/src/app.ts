import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler } from './middleware/error.middleware';
import { authLimiter, generalLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';
import taskRoutes from './routes/task.routes';
import noteRoutes from './routes/note.routes';
import reminderRoutes from './routes/reminder.routes';
import chatRoutes from './routes/chat.routes';
import profileRoutes from './routes/profile.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Socket handlers
import { initializeSockets } from './sockets';

// Cron jobs
import { startReminderCron } from './jobs/reminderCron';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Initialize socket handlers
  initializeSockets(io);
  
  // Start cron jobs
  startReminderCron(io);
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready`);
  });
};

startServer();

export { app, io };
