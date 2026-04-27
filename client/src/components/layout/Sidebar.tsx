import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  MessageCircle,
  StickyNote,
  Clock,
  UserCircle,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/chat', label: 'Chat', icon: MessageCircle, badge: true },
  { path: '/notes', label: 'Notes', icon: StickyNote },
  { path: '/reminders', label: 'Reminders', icon: Clock },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className="h-full w-64 flex flex-col border-r"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
        >
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Team Hub</h1>
          <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
            Productivity
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive && 'nav-active'
                )
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-muted)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-[3px] h-6 rounded-r-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Confirm Logout
              </h3>
              <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to logout? You'll need to sign in again.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleLogout} className="btn-danger">
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
