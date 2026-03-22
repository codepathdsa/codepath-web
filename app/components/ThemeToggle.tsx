'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Once mounted, sync state with what the inline script placed on <html>
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme as 'light' | 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // We return a compact, stylish moon/sun icon button
  // Render an empty div of identical size until hydration completes, 
  // to avoid Server/Client mismatch on the initial render icon.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button 
      onClick={toggleTheme}
      suppressHydrationWarning
      className="theme-toggle"
      aria-label="Toggle Dark Mode"
    >
      {mounted ? (theme === 'light' ? '🌙' : '☀️') : <span style={{ opacity: 0 }}>🌙</span>}
    </button>
  );
}
