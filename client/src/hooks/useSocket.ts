import { useEffect } from 'react';
import { useSocketStore } from '@/store/socketStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { socket, connect, disconnect, isConnected } = useSocketStore();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !socket) {
      connect(user._id);
    }

    return () => {
      // Don't disconnect on unmount — kept alive app-wide
    };
  }, [user]);

  // Listen for notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (notification: any) => {
      addNotification(notification);
      toast(notification.message || notification.title, {
        icon: '🔔',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        },
      });
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  return { socket, isConnected, disconnect };
};
