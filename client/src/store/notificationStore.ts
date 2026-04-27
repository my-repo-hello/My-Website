import { create } from 'zustand';
import { INotification } from '@/types';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));
