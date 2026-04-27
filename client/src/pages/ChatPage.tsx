import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Plus, Smile, Paperclip, Check, CheckCheck, X, MessageCircle } from 'lucide-react';
import { chatAPI } from '@/api/chat';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socketStore';
import { IConversation, IMessage, IUser } from '@/types';
import { relativeTime } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [convos, setConvos] = useState<IConversation[]>([]);
  const [active, setActive] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState('');
  const [showNew, setShowNew] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchConvos(); fetchUsers(); }, []);

  useEffect(() => {
    if (!socket || !active) return;
    socket.emit('join_conversation', active._id);
    socket.on('receive_message', (msg: IMessage) => {
      if (msg.conversationId === active._id) { setMessages(m => [...m, msg]); scrollToBottom(); }
    });
    socket.on('user_typing', (d: any) => { if (d.conversationId === active._id) setTyping(`${d.username} is typing...`); });
    socket.on('user_stop_typing', (d: any) => { if (d.conversationId === active._id) setTyping(''); });
    return () => { socket.emit('leave_conversation', active._id); socket.off('receive_message'); socket.off('user_typing'); socket.off('user_stop_typing'); };
  }, [socket, active]);

  const fetchConvos = async () => { try { const { data } = await chatAPI.getConversations(); setConvos(data.conversations); } catch {} };
  const fetchUsers = async () => { try { const { data } = await chatAPI.getUsers(); setUsers(data.users); } catch {} };
  const fetchMessages = async (id: string) => { try { const { data } = await chatAPI.getMessages(id); setMessages(data.messages); setTimeout(scrollToBottom, 100); } catch {} };
  const scrollToBottom = () => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });

  const openConvo = (c: IConversation) => { setActive(c); fetchMessages(c._id); if (socket) socket.emit('mark_seen', { conversationId: c._id, userId: user?._id }); };

  const handleSend = async () => {
    if (!input.trim() || !active || !user || !socket) return;
    socket.emit('send_message', { conversationId: active._id, senderId: user._id, content: input, type: 'text' });
    setInput('');
    socket.emit('typing_stop', { conversationId: active._id, userId: user._id });
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (!socket || !active || !user) return;
    if (val) socket.emit('typing_start', { conversationId: active._id, userId: user._id, username: user.displayName || user.username });
    else socket.emit('typing_stop', { conversationId: active._id, userId: user._id });
  };

  const startDM = async (u: IUser) => {
    try { const { data } = await chatAPI.createConversation({ type: 'private', members: [u._id] }); setShowNew(false); fetchConvos(); openConvo(data.conversation); }
    catch { toast.error('Failed'); }
  };

  const getConvoName = (c: IConversation) => {
    if (c.type === 'group') return c.name || 'Group Chat';
    const other = c.members.find(m => m._id !== user?._id);
    return other?.displayName || other?.username || 'User';
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 max-w-7xl">
      {/* Left - Conversations */}
      <div className="w-80 shrink-0 flex flex-col card p-0 overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Chats</h2>
            <button onClick={() => setShowNew(true)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"><Plus size={18} style={{ color: 'var(--accent)' }} /></button>
          </div>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 py-2 text-sm" placeholder="Search..." /></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convos.filter(c => getConvoName(c).toLowerCase().includes(search.toLowerCase())).map(c => (
            <div key={c._id} onClick={() => openConvo(c)} className="flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ background: active?._id === c._id ? 'var(--bg-elevated)' : undefined }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
                {getConvoName(c)[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{getConvoName(c)}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{c.lastMessage?.content || 'No messages'}</p>
              </div>
              {c.unreadCount > 0 && <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>{c.unreadCount}</span>}
            </div>
          ))}
          {convos.length === 0 && <div className="text-center py-8"><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No conversations</p></div>}
        </div>
      </div>

      {/* Right - Messages */}
      <div className="flex-1 flex flex-col card p-0 overflow-hidden">
        {active ? (<>
          <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>{getConvoName(active)[0].toUpperCase()}</div>
            <div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{getConvoName(active)}</p>
              {typing && <p className="text-xs" style={{ color: 'var(--accent)' }}>{typing}</p>}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => {
              const isMine = (msg.senderId as any)?._id === user?._id || String(msg.senderId) === user?._id;
              return (<div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={isMine ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                  {!isMine && <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>{(msg.senderId as any)?.displayName || 'User'}</p>}
                  {msg.type === 'image' && msg.fileUrl && <img src={msg.fileUrl} alt="" className="max-w-48 rounded-lg mb-2" />}
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                    <span className="text-[10px] opacity-60">{relativeTime(msg.timestamp)}</span>
                    {isMine && <span className="opacity-60">{msg.seenBy.length > 1 ? <CheckCheck size={12} /> : <Check size={12} />}</span>}
                  </div>
                </div>
              </div>);
            })}
            <div ref={messagesEnd} />
          </div>
          <div className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
            <input value={input} onChange={e => handleTyping(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="input flex-1" placeholder="Type a message..." />
            <button onClick={handleSend} className="btn-primary px-4"><Send size={16} /></button>
          </div>
        </>) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><MessageCircle size={48} style={{ color: 'var(--text-tertiary)' }} className="mx-auto mb-4" />
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Select a conversation to start chatting</p></div>
          </div>
        )}
      </div>

      {showNew && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowNew(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Conversation</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map(u => (<button key={u._id} onClick={() => startDM(u)} className="flex items-center gap-3 w-full p-3 rounded-xl transition-colors hover:bg-[var(--bg-elevated)]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>{(u.displayName || u.username)[0].toUpperCase()}</div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.displayName || u.username}</span></button>))}
              {users.length === 0 && <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No users found</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
