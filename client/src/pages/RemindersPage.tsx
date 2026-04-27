import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Bell, Check, Trash2, X } from 'lucide-react';
import { remindersAPI } from '@/api/reminders';
import { IReminder } from '@/types';
import { formatDateTime, relativeTime } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export default function RemindersPage() {
  const [data, setData] = useState<{ today: IReminder[]; upcoming: IReminder[]; past: IReminder[] }>({ today: [], upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', datetime: '', type: 'personal', repeat: 'none' });

  useEffect(() => { fetchReminders(); }, []);
  const fetchReminders = async () => {
    try { const { data: d } = await remindersAPI.getAll(); setData(d.reminders); }
    catch {} finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await remindersAPI.create(form); toast.success('Reminder created'); setShowCreate(false); setForm({ title: '', description: '', datetime: '', type: 'personal', repeat: 'none' }); fetchReminders(); }
    catch { toast.error('Failed'); }
  };

  const handleDismiss = async (id: string) => {
    try { await remindersAPI.dismiss(id); fetchReminders(); toast.success('Dismissed'); } catch {}
  };

  const handleDelete = async (id: string) => {
    try { await remindersAPI.delete(id); fetchReminders(); toast.success('Deleted'); } catch {}
  };

  const ReminderCard = ({ r }: { r: IReminder }) => (
    <motion.div layout className="card flex items-center gap-4 p-4">
      <div className="p-2 rounded-xl shrink-0" style={{ background: r.status === 'active' ? 'rgba(129,140,248,0.15)' : 'var(--bg-elevated)' }}>
        {r.status === 'active' ? <Bell size={18} style={{ color: 'var(--accent)' }} /> : <Check size={18} style={{ color: 'var(--success)' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.title}</h4>
        {r.description && <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{r.description}</p>}
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}><Clock size={12} /> {formatDateTime(r.datetime)}</p>
      </div>
      <div className="flex items-center gap-1">
        {r.repeat !== 'none' && <span className="badge badge-primary text-[10px]">{r.repeat}</span>}
        {r.status === 'active' && <button onClick={() => handleDismiss(r._id)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"><Check size={14} style={{ color: 'var(--success)' }} /></button>}
        <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
      </div>
    </motion.div>
  );

  const Section = ({ title, items, empty }: { title: string; items: IReminder[]; empty: string }) => (
    <div><h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{title} ({items.length})</h3>
      {items.length > 0 ? <div className="space-y-2">{items.map(r => <ReminderCard key={r._id} r={r} />)}</div>
      : <p className="text-sm py-4" style={{ color: 'var(--text-tertiary)' }}>{empty}</p>}</div>
  );

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reminders</h1></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Reminder</button>
      </div>
      <Section title="Today" items={data.today} empty="No reminders today" />
      <Section title="Upcoming" items={data.upcoming} empty="No upcoming reminders" />
      <Section title="Past" items={data.past} empty="No past reminders" />

      <AnimatePresence>{showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Reminder</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" placeholder="Reminder title" required />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" placeholder="Description" rows={2} />
              <input type="datetime-local" value={form.datetime} onChange={e => setForm({...form, datetime: e.target.value})} className="input" required />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input"><option value="personal">Personal</option><option value="team">Team</option></select>
                <select value={form.repeat} onChange={e => setForm({...form, repeat: e.target.value})} className="input"><option value="none">No Repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
