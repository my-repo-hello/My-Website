import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Bell, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { profileAPI } from '@/api/profile';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [inApp, setInApp] = useState(user?.notificationPrefs?.inApp ?? true);
  const [email, setEmail] = useState(user?.notificationPrefs?.email ?? true);
  const [tz, setTz] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleNotifSave = async () => {
    try { const { data } = await profileAPI.updateSettings({ notificationPrefs: { inApp, email } }); setUser(data.user); toast.success('Saved'); }
    catch { toast.error('Failed'); }
  };

  const handleTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    profileAPI.updateSettings({ theme: t }).catch(() => {});
  };

  const handleTzSave = async () => {
    try { const { data } = await profileAPI.updateSettings({ timezone: tz }); setUser(data.user); toast.success('Saved'); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await profileAPI.deleteAccount(deletePassword); await logout(); navigate('/login'); toast.success('Account deleted'); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  const themes = [{ id: 'light' as const, label: 'Light', icon: Sun }, { id: 'dark' as const, label: 'Dark', icon: Moon }, { id: 'system' as const, label: 'System', icon: Monitor }];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Theme</h3>
        <div className="flex gap-3">
          {themes.map(t => (
            <button key={t.id} onClick={() => handleTheme(t.id)} className="flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all"
              style={{ borderColor: theme === t.id ? 'var(--accent)' : 'var(--border)', background: theme === t.id ? 'var(--accent-muted)' : 'var(--bg-elevated)' }}>
              <t.icon size={24} style={{ color: theme === t.id ? 'var(--accent)' : 'var(--text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: theme === t.id ? 'var(--accent)' : 'var(--text-secondary)' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3"><Bell size={18} style={{ color: 'var(--text-secondary)' }} /><span className="text-sm" style={{ color: 'var(--text-primary)' }}>In-app notifications</span></div>
            <input type="checkbox" checked={inApp} onChange={e => setInApp(e.target.checked)} className="w-10 h-5 appearance-none rounded-full transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5" style={{ background: inApp ? 'var(--accent)' : 'var(--border)' }} />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3"><Mail size={18} style={{ color: 'var(--text-secondary)' }} /><span className="text-sm" style={{ color: 'var(--text-primary)' }}>Email notifications</span></div>
            <input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} className="w-10 h-5 appearance-none rounded-full transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5" style={{ background: email ? 'var(--accent)' : 'var(--border)' }} />
          </label>
          <button onClick={handleNotifSave} className="btn-primary">Save Preferences</button>
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Timezone</h3>
        <select value={tz} onChange={e => setTz(e.target.value)} className="input mb-4">
          {['UTC','America/New_York','America/Chicago','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Kolkata','Asia/Tokyo','Asia/Dubai','Asia/Singapore','Asia/Shanghai','Australia/Sydney','Pacific/Auckland'].map((t: string) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleTzSave} className="btn-primary">Save</button>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card border-2" style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
        <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} style={{ color: 'var(--danger)' }} /><h3 className="font-bold" style={{ color: 'var(--danger)' }}>Danger Zone</h3></div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Permanently delete your account and all data. This cannot be undone.</p>
        <button onClick={() => setShowDelete(true)} className="btn-danger"><Trash2 size={16} /> Delete Account</button>
      </motion.div>

      <AnimatePresence>{showDelete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowDelete(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--danger)' }}>Delete Account</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Enter your password to confirm deletion.</p>
            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className="input mb-4" placeholder="Your password" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={deleting || !deletePassword} className="btn-danger">{deleting ? 'Deleting...' : 'Delete Forever'}</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
