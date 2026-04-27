export const getPasswordStrength = (
  password: string
): { score: number; label: string; color: string } => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#f43f5e' };
  if (score <= 3) return { score, label: 'Medium', color: '#f59e0b' };
  return { score, label: 'Strong', color: '#10b981' };
};
