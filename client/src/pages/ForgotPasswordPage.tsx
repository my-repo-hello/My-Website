import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, KeyRound, Lock } from 'lucide-react';
import { authAPI } from '@/api/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP(email, otp);
      if (data.verified) {
        toast.success('OTP verified');
        setStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Email', icon: Mail },
    { num: 2, label: 'Verify', icon: KeyRound },
    { num: 3, label: 'Reset', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 mb-8 text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Back to login
        </Link>

        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Reset Password</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Follow the steps to reset your password</p>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                style={{
                  background: step >= s.num ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: step >= s.num ? 'white' : 'var(--text-tertiary)',
                }}
              >
                {s.num}
              </div>
              {i < steps.length - 1 && (
                <div className="h-0.5 flex-1 rounded" style={{ background: step > s.num ? 'var(--accent)' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>

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

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input" placeholder="Enter your registered email" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Enter 6-digit OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-2xl tracking-[12px] font-mono" placeholder="000000" required maxLength={6} />
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>Code sent to {email}. Expires in 10 minutes.</p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full justify-center py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Verify OTP <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="input" placeholder="Enter new password" required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="input" placeholder="Confirm new password" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Reset Password <ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
