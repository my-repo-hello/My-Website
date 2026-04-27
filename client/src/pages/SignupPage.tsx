import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/api/auth';
import { useDebounce } from '@/hooks/useDebounce';
import { getPasswordStrength } from '@/utils/passwordStrength';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const debouncedEmail = useDebounce(email, 300);

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Debounced email check
  useEffect(() => {
    if (!debouncedEmail || !debouncedEmail.includes('@')) {
      setEmailExists(null);
      return;
    }
    const check = async () => {
      setCheckingEmail(true);
      try {
        const { data } = await authAPI.checkEmail(debouncedEmail);
        setEmailExists(data.exists);
      } catch {
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    };
    check();
  }, [debouncedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength.score < 3) {
      setError('Password is too weak');
      return;
    }
    if (emailExists) {
      setError('Email already registered');
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
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
            className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
          >
            <Zap size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 text-white">Join Team Hub</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Start tracking your habits, managing tasks, and collaborating with your team.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
            >
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Team Hub</span>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create account</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Sign up to get started</p>

          {error && (
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4 p-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Choose a username"
                required
                minLength={3}
                id="signup-username-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pr-10"
                  placeholder="you@example.com"
                  required
                  id="signup-email-input"
                />
                {email.includes('@') && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingEmail ? (
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    ) : emailExists ? (
                      <X size={16} style={{ color: 'var(--danger)' }} />
                    ) : emailExists === false ? (
                      <Check size={16} style={{ color: 'var(--success)' }} />
                    ) : null}
                  </span>
                )}
              </div>
              {emailExists && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Email already registered</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  id="signup-password-input"
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
              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{
                          background: i <= strength.score ? strength.color : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Repeat your password"
                  required
                  id="signup-confirm-password-input"
                />
                {confirmPassword.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check size={16} style={{ color: 'var(--success)' }} />
                    ) : passwordsMismatch ? (
                      <X size={16} style={{ color: 'var(--danger)' }} />
                    ) : null}
                  </span>
                )}
              </div>
              {passwordsMismatch && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || emailExists === true || passwordsMismatch}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
              id="signup-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
