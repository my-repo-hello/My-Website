import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Copy, Save, X, Check } from 'lucide-react';
import { profileAPI } from '@/api/profile';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => { profileAPI.getStats().then(({ data }) => setStats(data.stats)).catch(() => {}); }, []);

  const handleSave = async () => {
    setSaving(true);
    try { const { data } = await profileAPI.update({ displayName, bio, skills }); setUser(data.user); toast.success('Profile updated'); }
    catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('avatar', file);
    try { const { data } = await profileAPI.uploadAvatar(fd); setUser(data.user); toast.success('Avatar updated'); }
    catch { toast.error('Failed'); }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords mismatch'); return; }
    try { await profileAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); toast.success('Password changed'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const copyId = () => { navigator.clipboard.writeText(user?._id || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
              style={{ background: user?.avatar ? `url(${user.avatar}) center/cover` : 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
              {!user?.avatar && (user?.displayName?.[0] || 'U').toUpperCase()}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'var(--accent)' }}>
              <Camera size={14} className="text-white" /><input type="file" accept="image/*" onChange={handleAvatar} className="hidden" /></label>
          </div>
          <div><h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user?.displayName || user?.username}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{user?.username}</p>
            <span className="badge badge-primary mt-1">{user?.role}</span></div>
        </div>

        <div className="space-y-4">
          <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="input" /></div>
          <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="input" rows={3} placeholder="Tell us about yourself..." /></div>
          <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input value={user?.email || ''} disabled className="input opacity-60" /></div>
          <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>User ID</label>
            <div className="flex gap-2"><input value={user?._id || ''} disabled className="input flex-1 opacity-60 font-mono text-xs" />
              <button onClick={copyId} className="btn-secondary px-3">{copied ? <Check size={14} /> : <Copy size={14} />}</button></div></div>
          <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">{skills.map(s => <span key={s} className="badge badge-primary flex items-center gap-1">{s}<button onClick={() => setSkills(skills.filter(x => x !== s))}><X size={10} /></button></span>)}</div>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { e.preventDefault(); setSkills([...skills, skillInput.trim()]); setSkillInput(''); }}} className="input" placeholder="Add skill + Enter" /></div>
          <button onClick={handleSave} disabled={saving} className="btn-primary"><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: 'Tasks Done', val: stats.tasksCompleted, icon: '✅' }, { label: 'Habits', val: stats.habitsTracked, icon: '🎯' }, { label: 'Notes', val: stats.notesCreated, icon: '📝' }, { label: 'Member Since', val: formatDate(stats.memberSince), icon: '📅' }].map(s => (
            <div key={s.label} className="card text-center"><p className="text-2xl mb-1">{s.icon}</p><p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.val}</p><p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p></div>
          ))}
        </div>
      )}

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} className="input" placeholder="Current password" required />
          <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} className="input" placeholder="New password" required minLength={8} />
          <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} className="input" placeholder="Confirm new password" required />
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </motion.div>
    </div>
  );
}
