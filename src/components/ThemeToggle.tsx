'use client';

import { useEffect, useState } from 'react';
import { HiMoon, HiSun } from 'react-icons/hi';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <>
          <HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-5" />
          <span className=" ml-5 font-lg text-gray-700 dark:text-gray-200">Dark</span>
        </>
      ) : (
        <>
          <HiSun className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-5" />
          <span className="ml-5 font-lg text-gray-700 dark:text-gray-200">Light</span>
        </>
      )}
    </button>
  );
}
