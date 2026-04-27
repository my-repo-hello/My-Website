import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, Search, GripVertical, MessageSquare, Clock, X } from 'lucide-react';
import { tasksAPI } from '@/api/tasks';
import { profileAPI } from '@/api/profile';
import { ITask, IUser } from '@/types';
import { relativeTime, formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'pending', label: 'Pending', color: '#f59e0b' },
  { id: 'in-progress', label: 'In Progress', color: '#818cf8' },
  { id: 'completed', label: 'Completed', color: '#10b981' },
] as const;

const PC: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#f43f5e' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<ITask | null>(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', tags: '' });
  const [comment, setComment] = useState('');

  useEffect(() => { fetchTasks(); }, []);
  const fetchTasks = async () => {
    try { const { data } = await tasksAPI.getAll(); setTasks(data.tasks); }
    catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksAPI.create({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
      toast.success('Task created'); setShowCreate(false);
      setForm({ title: '', description: '', dueDate: '', priority: 'medium', tags: '' }); fetchTasks();
    } catch { toast.error('Failed'); }
  };

  const handleStatus = async (id: string, s: string) => {
    try { await tasksAPI.updateStatus(id, s); fetchTasks(); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleComment = async () => {
    if (!selected || !comment.trim()) return;
    try { const { data } = await tasksAPI.addComment(selected._id, comment); setSelected(data.task); setComment(''); fetchTasks(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    try { await tasksAPI.delete(id); setTasks(t => t.filter(x => x._id !== id)); setSelected(null); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{tasks.length} total</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Task</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" placeholder="Search..." />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input w-auto">
          <option value="">All Priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setView('kanban')} className="p-2" style={{ background: view === 'kanban' ? 'var(--accent)' : 'var(--bg-elevated)', color: view === 'kanban' ? 'white' : 'var(--text-secondary)' }}><LayoutGrid size={16} /></button>
          <button onClick={() => setView('list')} className="p-2" style={{ background: view === 'list' ? 'var(--accent)' : 'var(--bg-elevated)', color: view === 'list' ? 'white' : 'var(--text-secondary)' }}><List size={16} /></button>
        </div>
      </div>

      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const ct = filtered.filter(t => t.status === col.id);
            return (<div key={col.id} className="kanban-column">
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{col.label}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{ct.length}</span>
              </div>
              <div className="space-y-3">
                {ct.map(task => (
                  <motion.div key={task._id} layout className="card cursor-pointer p-4" onClick={() => setSelected(task)}>
                    <div className="flex items-start gap-2 mb-2">
                      <GripVertical size={14} style={{ color: 'var(--text-tertiary)' }} className="mt-0.5" />
                      <h4 className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{task.title}</h4>
                    </div>
                    {task.description && <p className="text-xs mb-3 ml-5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>}
                    <div className="flex items-center justify-between ml-5">
                      <span className="badge" style={{ background: `${PC[task.priority]}20`, color: PC[task.priority] }}>{task.priority}</span>
                      <div className="flex items-center gap-2">
                        {task.dueDate && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatDate(task.dueDate)}</span>}
                        {task.comments?.length > 0 && <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}><MessageSquare size={12} />{task.comments.length}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {ct.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>No tasks</p>}
              </div>
            </div>);
          })}
        </div>
      )}

      {view === 'list' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr style={{ background: 'var(--bg-elevated)' }}>
              {['Title','Priority','Status','Due Date'].map(h => <th key={h} className="text-left p-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map(t => (
              <tr key={t._id} className="border-t cursor-pointer hover:bg-[var(--bg-elevated)]" style={{ borderColor: 'var(--border)' }} onClick={() => setSelected(t)}>
                <td className="p-3 font-medium" style={{ color: 'var(--text-primary)' }}>{t.title}</td>
                <td className="p-3"><span className="badge" style={{ background: `${PC[t.priority]}20`, color: PC[t.priority] }}>{t.priority}</span></td>
                <td className="p-3"><span className="badge badge-primary">{t.status}</span></td>
                <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{t.dueDate ? formatDate(t.dueDate) : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <AnimatePresence>{showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create Task</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" placeholder="Task title" required />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" placeholder="Description" rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input" />
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="input" placeholder="Tags (comma separated)" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      <AnimatePresence>{selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setSelected(null)}>
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg overflow-y-auto border-l" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selected.title}</h2>
                <button onClick={() => setSelected(null)}><X size={20} style={{ color: 'var(--text-tertiary)' }} /></button>
              </div>
              {selected.description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.description}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Status</label>
                  <select value={selected.status} onChange={e => handleStatus(selected._id, e.target.value)} className="input">
                    <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
                  </select></div>
                <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Priority</label>
                  <span className="badge" style={{ background: `${PC[selected.priority]}20`, color: PC[selected.priority] }}>{selected.priority}</span></div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Comments</h4>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {selected.comments?.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{(c.user as any)?.displayName || 'User'} · {relativeTime(c.createdAt)}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={comment} onChange={e => setComment(e.target.value)} className="input flex-1" placeholder="Comment..." onKeyDown={e => e.key === 'Enter' && handleComment()} />
                  <button onClick={handleComment} className="btn-primary px-4">Send</button>
                </div>
              </div>
              {selected.activityLog?.length > 0 && (
                <div><h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Activity</h4>
                  {selected.activityLog.slice(-5).reverse().map((l, i) => (
                    <p key={i} className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                      <Clock size={10} className="inline mr-1" />{(l.user as any)?.displayName || 'User'} {l.action} · {relativeTime(l.timestamp)}
                    </p>
                  ))}</div>
              )}
              <button onClick={() => handleDelete(selected._id)} className="btn-danger w-full justify-center">Delete Task</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
