'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { themeLight, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      title={themeLight ? '切换到深色模式' : '切换到浅色模式'}
    >
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        {themeLight ? (
          // 月亮图标 - 深色模式
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        ) : (
          // 太阳图标 - 浅色模式
          <>
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </>
        )}
      </svg>
    </button>
  );
}
