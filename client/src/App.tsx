import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import MainLayout from '@/components/layout/MainLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy loaded pages
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const SignupPage = React.lazy(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const HabitsPage = React.lazy(() => import('@/pages/HabitsPage'));
const TasksPage = React.lazy(() => import('@/pages/TasksPage'));
const ChatPage = React.lazy(() => import('@/pages/ChatPage'));
const NotesPage = React.lazy(() => import('@/pages/NotesPage'));
const RemindersPage = React.lazy(() => import('@/pages/RemindersPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  const { checkAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="habits" element={<HabitsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
