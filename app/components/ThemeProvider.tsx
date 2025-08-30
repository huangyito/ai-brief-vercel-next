'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeLight: boolean; // 保持向后兼容
  setTheme: (theme: 'light' | 'dark') => void;
  setThemeLight: (value: boolean) => void; // 保持向后兼容
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeLight, setThemeLight] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // 确保在客户端渲染后再读取localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // 主题持久化
  useEffect(() => {
    if (!mounted) return;

    try {
      const savedTheme = localStorage.getItem('ai-brief-theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
        setThemeLight(savedTheme === 'light');
      } else {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        setThemeState(defaultTheme);
        setThemeLight(!prefersDark);
        // 保存默认主题到localStorage
        localStorage.setItem('ai-brief-theme', defaultTheme);
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      // 使用系统主题偏好作为后备
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setThemeState(defaultTheme);
      setThemeLight(!prefersDark);
    }
  }, [mounted]);

  // 保存主题到 localStorage
  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem('ai-brief-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme, mounted]);

  // 应用主题到HTML元素
  useEffect(() => {
    if (!mounted) return;

    const htmlElement = document.documentElement;
    
    // 清除所有主题类并添加当前主题类
    htmlElement.className = theme;
  }, [theme, mounted]);

  // 监听系统主题变化
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('ai-brief-theme');
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
        setThemeLight(newTheme === 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  // 监听localStorage变化（跨标签页同步）
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai-brief-theme' && e.newValue) {
        const newTheme = e.newValue as 'light' | 'dark';
        console.log('Theme synced from storage:', newTheme);
        setThemeState(newTheme);
        setThemeLight(newTheme === 'light');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Theme toggled:', { from: theme, to: newTheme });
    setThemeState(newTheme);
    setThemeLight(newTheme === 'light');
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    console.log('Theme set:', { from: theme, to: newTheme });
    setThemeState(newTheme);
    setThemeLight(newTheme === 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeLight, setTheme, setThemeLight, toggleTheme }}>
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
