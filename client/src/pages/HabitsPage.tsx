import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Check, X, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { habitsAPI } from '@/api/habits';
import { IHabit } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES = ['Health', 'Work', 'Learning', 'Fitness', 'Other'];
const CAT_EMOJI: Record<string, string> = { Health: '💚', Work: '💼', Learning: '📚', Fitness: '🏋️', Other: '✨' };

export default function HabitsPage() {
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Other', frequency: 'daily', color: '#818cf8' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try {
      const [h, a] = await Promise.all([habitsAPI.getAll(), habitsAPI.getAnalytics()]);
      setHabits(h.data.habits); setAnalytics(a.data.analytics);
    } catch {} finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await habitsAPI.create(form); toast.success('Habit created!'); setShowCreate(false); setForm({ name: '', category: 'Other', frequency: 'daily', color: '#818cf8' }); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const handleToggle = async (id: string) => {
    try { await habitsAPI.toggleLog(id); fetchData(); toast.success('Updated!'); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    try { await habitsAPI.delete(id); setHabits(h => h.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Habit Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{habits.length} habits tracked</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Habit</button>
      </div>

      {habits.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🎯</p>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No habits yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Start building positive habits today!</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto"><Plus size={16} /> Create First Habit</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit, i) => (
              <motion.div key={habit._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="card relative overflow-hidden" style={{ borderLeft: `4px solid ${habit.color}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{habit.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{CAT_EMOJI[habit.category]} {habit.category} · {habit.frequency}</p></div>
                  <button onClick={() => handleDelete(habit._id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} style={{ color: 'var(--text-tertiary)' }} /></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1"><Flame size={16} style={{ color: '#f59e0b' }} /><span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{habit.currentStreak}</span><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>streak</span></div>
                    {habit.todayStatus === 'pending' && <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--warning)' }}><AlertTriangle size={12} /> At risk</span>}
                  </div>
                  <button onClick={() => handleToggle(habit._id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: habit.todayStatus === 'completed' ? habit.color : 'var(--bg-elevated)', color: habit.todayStatus === 'completed' ? 'white' : 'var(--text-tertiary)' }}>
                    {habit.todayStatus === 'completed' ? <Check size={20} /> : <span className="text-lg">○</span>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {analytics.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Completion Rates</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics}><XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} /><YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }} /><Bar dataKey="completionRate" fill="#818cf8" radius={[6,6,0,0]} name="Completion %" /></BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>{showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Habit</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Habit name" required />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input">
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
              </select>
              <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="input">
                <option value="daily">Daily</option><option value="weekly">Weekly</option>
              </select>
              <div><label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Color</label>
                <div className="flex gap-2">
                  {['#818cf8','#f43f5e','#10b981','#f59e0b','#06b6d4','#8b5cf6','#ec4899'].map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})} className="w-8 h-8 rounded-lg transition-transform" style={{ background: c, transform: form.color === c ? 'scale(1.2)' : 'scale(1)', boxShadow: form.color === c ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${c}` : 'none' }} />
                  ))}
                </div>
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
