import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pin, PinOff, Trash2, X, Save } from 'lucide-react';
import { notesAPI } from '@/api/notes';
import { INote } from '@/types';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState<INote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<INote | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editShared, setEditShared] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(true);

  useEffect(() => { fetchNotes(); }, [search, filter]);
  const fetchNotes = async () => {
    try { const { data } = await notesAPI.getAll({ search, filter: filter === 'all' ? undefined : filter }); setNotes(data.notes); }
    catch {} finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try { const { data } = await notesAPI.create({ title: 'Untitled Note', content: '' });
      setEditing(data.note); setEditTitle('Untitled Note'); setEditContent(''); setEditTags([]); setEditShared(false); fetchNotes();
    } catch { toast.error('Failed'); }
  };

  const handleSave = useCallback(async () => {
    if (!editing) return;
    try { await notesAPI.update(editing._id, { title: editTitle, content: editContent, tags: editTags, isShared: editShared }); setSaved(true); fetchNotes(); }
    catch { toast.error('Failed to save'); }
  }, [editing, editTitle, editContent, editTags, editShared]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!editing || saved) return;
    const timer = setTimeout(handleSave, 30000);
    return () => clearTimeout(timer);
  }, [editing, saved, handleSave]);

  const openNote = (note: INote) => {
    setEditing(note); setEditTitle(note.title); setEditContent(note.content); setEditTags(note.tags); setEditShared(note.isShared); setSaved(true);
  };

  const handleTogglePin = async (id: string) => {
    try { await notesAPI.togglePin(id); fetchNotes(); } catch {}
  };

  const handleDelete = async (id: string) => {
    try { await notesAPI.delete(id); setNotes(n => n.filter(x => x._id !== id)); if (editing?._id === id) setEditing(null); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const addTag = () => {
    if (tagInput.trim() && !editTags.includes(tagInput.trim())) {
      setEditTags([...editTags, tagInput.trim()]); setTagInput(''); setSaved(false);
    }
  };

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{notes.length} notes</p></div>
        <button onClick={handleCreate} className="btn-primary"><Plus size={16} /> New Note</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" placeholder="Search notes..." />
        </div>
        {['all','personal','shared'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn-ghost capitalize" style={{ background: filter === f ? 'var(--accent-muted)' : undefined, color: filter === f ? 'var(--accent)' : undefined }}>{f}</button>
        ))}
      </div>

      {notes.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📝</p>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No notes yet</h3>
          <button onClick={handleCreate} className="btn-primary mx-auto"><Plus size={16} /> Create Note</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div key={note._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="card cursor-pointer group" onClick={() => openNote(note)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleTogglePin(note._id)} className="p-1">{note.isPinned ? <PinOff size={14} style={{ color: 'var(--accent)' }} /> : <Pin size={14} style={{ color: 'var(--text-tertiary)' }} />}</button>
                  <button onClick={() => handleDelete(note._id)} className="p-1"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                </div>
              </div>
              <p className="text-xs line-clamp-3 mb-3" style={{ color: 'var(--text-secondary)' }}>{note.content?.replace(/<[^>]*>/g, '').slice(0, 150) || 'Empty note'}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">{note.tags?.slice(0, 3).map(t => <span key={t} className="badge badge-primary text-[10px]">{t}</span>)}</div>
                <div className="flex items-center gap-2">{note.isPinned && <Pin size={12} style={{ color: 'var(--accent)' }} />}{note.isShared && <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Shared</span>}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>{editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => { handleSave(); setEditing(null); }}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-content max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <input value={editTitle} onChange={e => { setEditTitle(e.target.value); setSaved(false); }} className="text-xl font-bold bg-transparent border-none outline-none flex-1" style={{ color: 'var(--text-primary)' }} placeholder="Note title" />
              <div className="flex items-center gap-2">
                {saved ? <span className="text-xs flex items-center gap-1" style={{ color: 'var(--success)' }}><Save size={12} /> Saved</span> : <span className="text-xs" style={{ color: 'var(--warning)' }}>Unsaved</span>}
                <button onClick={() => { handleSave(); setEditing(null); }}><X size={20} style={{ color: 'var(--text-tertiary)' }} /></button>
              </div>
            </div>
            <textarea value={editContent} onChange={e => { setEditContent(e.target.value); setSaved(false); }}
              className="input min-h-[200px] resize-y font-mono text-sm" placeholder="Start writing..." />
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {editTags.map(t => <span key={t} className="badge badge-primary flex items-center gap-1">{t}<button onClick={() => { setEditTags(editTags.filter(x => x !== t)); setSaved(false); }}><X size={10} /></button></span>)}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="input w-32" placeholder="Add tag..." />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editShared} onChange={e => { setEditShared(e.target.checked); setSaved(false); }} className="accent-[var(--accent)]" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share with team</span>
              </label>
              <button onClick={handleSave} className="btn-primary"><Save size={16} /> Save</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
