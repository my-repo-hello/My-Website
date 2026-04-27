import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme) => {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.classList.toggle('light', resolved === 'light');
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'dark',

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  initTheme: () => {
    const saved = (localStorage.getItem('theme') as Theme) || 'dark';
    applyTheme(saved);
    set({ theme: saved });
  },
}));
