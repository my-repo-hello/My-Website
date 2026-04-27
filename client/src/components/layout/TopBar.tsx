import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { notificationsAPI } from '@/api/reminders';
import { relativeTime } from '@/utils/formatDate';

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { timeString, dateString } = useClock();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, setNotifications, setUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await notificationsAPI.getAll();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    markAsRead(id);
    try { await notificationsAPI.markAsRead(id); } catch {}
  };

  const handleMarkAllRead = async () => {
    markAllAsRead();
    try { await notificationsAPI.markAllAsRead(); } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const typeIcons: Record<string, string> = {
    reminder: '⏰',
    task: '✅',
    chat: '💬',
    habit: '🔥',
    system: '🔔',
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 border-b shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Left: Menu + Clock */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
          id="menu-toggle-btn"
        >
          <Menu size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>
        
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-lg font-mono font-semibold" style={{ color: 'var(--accent)' }}>
            {timeString}
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>|</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {dateString}
          </span>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
            id="notification-bell-btn"
          >
            <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ background: 'var(--danger)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-xl z-50"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      Mark all read
                    </button>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-3xl mb-2">🔔</p>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleMarkRead(notif._id)}
                      className="flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-[var(--bg-elevated)]"
                      style={{ opacity: notif.isRead ? 0.6 : 1 }}
                    >
                      <span className="text-lg shrink-0">{typeIcons[notif.type] || '🔔'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {notif.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                          {notif.message}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                          {relativeTime(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent)' }} />
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
            id="profile-dropdown-btn"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{
                background: user?.avatar
                  ? `url(${user.avatar}) center/cover`
                  : 'linear-gradient(135deg, #818cf8, #6366f1)',
              }}
            >
              {!user?.avatar && (user?.displayName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {user?.displayName || user?.username}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-52 rounded-xl border shadow-xl z-50 py-2"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => { navigate('/profile'); setShowProfile(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <User size={16} /> View Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Settings size={16} /> Settings
                </button>
                <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--danger)' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
