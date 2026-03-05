import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React from 'react';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isDarkMode: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isDarkMode: false,

      setTheme: (theme) => {
        set({ theme, isDarkMode: theme === 'dark' });
        // Применяем класс к document с проверкой
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      enableDarkMode: () => get().setTheme('dark'),
      disableDarkMode: () => get().setTheme('light'),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            // Применяем тему после загрузки из localStorage
            if (typeof document !== 'undefined' && state.theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          }
        };
      },
    }
  )
);

// Хук для инициализации темы при загрузке
export const useThemeInit = () => {
  const { theme, setTheme } = useThemeStore();

  // Инициализация при монтировании
  React.useEffect(() => {
    // Проверяем системные настройки
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme-storage');
    
    if (!savedTheme) {
      // Если нет сохраненной темы, используем системную
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      // Применяем сохраненную тему
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return { theme };
};
