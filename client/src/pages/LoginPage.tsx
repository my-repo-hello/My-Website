import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(emailOrUsername, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(129,140,248,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(99,102,241,0.2) 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 max-w-md text-center px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
          >
            <Zap size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4 text-white"
          >
            Team Hub
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-300 leading-relaxed"
          >
            Your all-in-one productivity platform. Track habits, manage tasks, collaborate in real-time.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex gap-4 justify-center"
          >
            {['🎯 Habits', '✅ Tasks', '💬 Chat', '📝 Notes'].map((item, i) => (
              <div key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
            >
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Team Hub</span>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account to continue
          </p>

          {error && (
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4 p-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', border: '1px solid rgba(244, 63, 94, 0.2)' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email or Username
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="input"
                placeholder="Enter your email or username"
                required
                id="login-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="Enter your password"
                  required
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base"
              id="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold" style={{ color: 'var(--accent)' }}>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
