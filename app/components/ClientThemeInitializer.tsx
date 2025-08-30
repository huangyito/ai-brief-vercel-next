'use client';

import { useEffect } from 'react';

export function ClientThemeInitializer() {
  useEffect(() => {
    // 只在客户端执行，避免水合不匹配
    try {
      const savedTheme = localStorage.getItem('ai-brief-theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        document.documentElement.className = savedTheme;
      } else {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        document.documentElement.className = defaultTheme;
        // 保存默认主题到localStorage
        localStorage.setItem('ai-brief-theme', defaultTheme);
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      // 使用系统主题偏好作为后备
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      document.documentElement.className = defaultTheme;
    }
  }, []);

  return null; // 这个组件不渲染任何内容
}
