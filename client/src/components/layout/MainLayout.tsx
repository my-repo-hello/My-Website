import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useSocket } from '@/hooks/useSocket';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Initialize socket connection
  useSocket();

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <TopBar onMenuToggle={() => {
        // Desktop toggle
        if (window.innerWidth >= 1024) {
          setSidebarOpen(!sidebarOpen);
        } else {
          setMobileSidebarOpen(!mobileSidebarOpen);
        }
      }} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'}`}>
          {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden"
              >
                <Sidebar onClose={() => setMobileSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
