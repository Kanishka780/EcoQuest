import React, { useEffect } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Load theme on mount
    const stored = localStorage.getItem('eq_theme') as 'light' | 'dark' | 'system' | null;
    if (stored) {
      setTheme(stored);
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  return (
    <div 
      className="flex items-center space-x-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
      role="radiogroup" 
      aria-label="Color theme switcher"
    >
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
          theme === 'light' 
            ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
        }`}
        role="radio"
        aria-checked={theme === 'light'}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
          theme === 'dark' 
            ? 'bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
        }`}
        role="radio"
        aria-checked={theme === 'dark'}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
          theme === 'system' 
            ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
        }`}
        role="radio"
        aria-checked={theme === 'system'}
        aria-label="System preference"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
