import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, CheckSquare, MessageCircle, Clock, Plus, Flame, TrendingUp, ArrowRight } from 'lucide-react';
import { dashboardAPI } from '@/api/profile';
import { IDashboardSummary } from '@/types';
import { relativeTime } from '@/utils/formatDate';

export default function DashboardPage() {
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await dashboardAPI.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Habit Progress',
      icon: Target,
      color: '#818cf8',
      value: `${summary?.habitProgress.completed || 0} of ${summary?.habitProgress.total || 0}`,
      sub: 'habits completed today',
      progress: summary?.habitProgress.percentage || 0,
      link: '/habits',
    },
    {
      title: 'Pending Tasks',
      icon: CheckSquare,
      color: '#f59e0b',
      value: summary?.pendingTasks.total || 0,
      sub: `🔴 ${summary?.pendingTasks.high || 0} High  🟡 ${summary?.pendingTasks.medium || 0} Med  🟢 ${summary?.pendingTasks.low || 0} Low`,
      link: '/tasks',
    },
    {
      title: 'Recent Messages',
      icon: MessageCircle,
      color: '#10b981',
      value: summary?.recentMessages?.length || 0,
      sub: summary?.recentMessages?.[0]
        ? `${(summary.recentMessages[0].senderId as any)?.displayName || 'User'}: ${summary.recentMessages[0].content?.slice(0, 30)}...`
        : 'No recent messages',
      link: '/chat',
    },
    {
      title: 'Upcoming Reminders',
      icon: Clock,
      color: '#f43f5e',
      value: summary?.upcomingReminders?.length || 0,
      sub: summary?.upcomingReminders?.[0]?.title || 'No upcoming reminders',
      link: '/reminders',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your productivity at a glance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={card.link} className="card block group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl" style={{ background: `${card.color}15` }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.sub}</p>
              {card.progress !== undefined && typeof card.progress === 'number' && (
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: card.color }}
                  />
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Productivity</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.weeklyChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="tasksCompleted" fill="#818cf8" radius={[6, 6, 0, 0]} name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Habit Streak Leaderboard */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} style={{ color: '#f59e0b' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Top Streaks</h3>
          </div>
          {summary?.habitLeaderboard && summary.habitLeaderboard.length > 0 ? (
            <div className="space-y-3">
              {summary.habitLeaderboard.map((habit, i) => (
                <div key={habit._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <span className="text-lg">{['🥇', '🥈', '🥉'][i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{habit.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{habit.category}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>🔥 {habit.currentStreak}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🔥</p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Start a habit to build streaks!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-3"
      >
        <Link to="/tasks" className="btn-primary"><Plus size={16} /> New Task</Link>
        <Link to="/habits" className="btn-primary" style={{ background: '#10b981' }}><Plus size={16} /> New Habit</Link>
        <Link to="/notes" className="btn-primary" style={{ background: '#f59e0b' }}><Plus size={16} /> New Note</Link>
      </motion.div>
    </div>
  );
}
