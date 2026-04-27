import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center max-w-md px-8">
        <h1 className="text-8xl font-bold mb-4 text-gradient">404</h1>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <Home size={16} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
