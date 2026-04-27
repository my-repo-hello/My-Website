import { create } from 'zustand';
import { IUser } from '@/types';
import { authAPI } from '@/api/auth';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: IUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (emailOrUsername: string, password: string) => {
    const { data } = await authAPI.login({ emailOrUsername, password });
    set({ user: data.user, isAuthenticated: true });
  },

  signup: async (username: string, email: string, password: string) => {
    const { data } = await authAPI.signup({ username, email, password });
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const { data } = await authAPI.getMe();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: IUser) => set({ user }),
}));
