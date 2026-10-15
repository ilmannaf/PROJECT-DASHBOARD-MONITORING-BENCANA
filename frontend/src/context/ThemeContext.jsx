import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextValue';

const THEME_STORAGE_KEY = 'admin-dark-mode';

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const isDark = saved !== null
    ? saved === 'true'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  return isDark;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, String(isDark));
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  const toggleTheme = () => setIsDark((p) => !p);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}