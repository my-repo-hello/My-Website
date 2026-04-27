// ============ USER ============
export interface IUser {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: 'admin' | 'member';
  skills: string[];
  notificationPrefs: {
    inApp: boolean;
    email: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  createdAt: string;
}

// ============ AUTH ============
export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

// ============ TASK ============
export interface ITask {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: IUser[];
  tags: string[];
  createdBy: IUser;
  comments: IComment[];
  activityLog: IActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  user: IUser;
  text: string;
  createdAt: string;
}

export interface IActivityLog {
  _id: string;
  user: IUser;
  action: string;
  timestamp: string;
}

// ============ HABIT ============
export interface IHabit {
  _id: string;
  userId: string;
  name: string;
  category: 'Health' | 'Work' | 'Learning' | 'Fitness' | 'Other';
  frequency: 'daily' | 'weekly' | 'custom';
  customDays: number[];
  color: string;
  currentStreak: number;
  longestStreak: number;
  todayStatus: 'completed' | 'missed' | 'pending';
  createdAt: string;
}

export interface IHabitLog {
  _id: string;
  habitId: string | { _id: string; name: string; color: string };
  userId: string;
  date: string;
  status: 'completed' | 'missed' | 'pending';
}

export interface IHabitAnalytics {
  habitId: string;
  name: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  logs: IHabitLog[];
}

// ============ NOTE ============
export interface INote {
  _id: string;
  userId: IUser;
  title: string;
  content: string;
  tags: string[];
  isShared: boolean;
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ============ REMINDER ============
export interface IReminder {
  _id: string;
  userId: string;
  title: string;
  description: string;
  datetime: string;
  type: 'personal' | 'team';
  repeat: 'none' | 'daily' | 'weekly';
  linkedTask?: ITask;
  status: 'active' | 'dismissed' | 'completed';
  createdAt: string;
}

// ============ CHAT ============
export interface IConversation {
  _id: string;
  type: 'group' | 'private';
  members: IUser[];
  name: string;
  lastMessage: {
    content: string;
    senderId: string | IUser;
    timestamp: string;
  };
  unreadCount: number;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  senderId: IUser;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl: string;
  fileName: string;
  seenBy: string[];
  deliveredTo: string[];
  replyTo?: IMessage;
  reactions: {
    emoji: string;
    userId: string;
  }[];
  timestamp: string;
}

// ============ NOTIFICATION ============
export interface INotification {
  _id: string;
  userId: string;
  type: 'reminder' | 'task' | 'chat' | 'habit' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

// ============ DASHBOARD ============
export interface IDashboardSummary {
  habitProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  pendingTasks: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  recentMessages: IMessage[];
  upcomingReminders: IReminder[];
  weeklyChart: {
    day: string;
    date: string;
    tasksCompleted: number;
  }[];
  habitLeaderboard: IHabit[];
}
