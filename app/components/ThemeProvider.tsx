'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  themeLight: boolean;
  setThemeLight: (value: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeLight, setThemeLight] = useState(false);

  // 主题持久化
  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-brief-theme');
    if (savedTheme) {
      setThemeLight(savedTheme === 'light');
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeLight(!prefersDark);
    }
  }, []);

  // 保存主题到 localStorage
  useEffect(() => {
    localStorage.setItem('ai-brief-theme', themeLight ? 'light' : 'dark');
  }, [themeLight]);

  // 应用主题到HTML元素
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (themeLight) {
      htmlElement.classList.add('light');
    } else {
      htmlElement.classList.remove('light');
    }
  }, [themeLight]);

  const toggleTheme = () => setThemeLight(v => !v);

  return (
    <ThemeContext.Provider value={{ themeLight, setThemeLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
