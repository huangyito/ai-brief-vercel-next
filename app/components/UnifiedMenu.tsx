'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getColor } from '../utils/themeColors';

// 移动端专用的主题切换按钮组件
function MobileThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // 检查当前主题
    const html = document.documentElement;
    setIsDark(html.classList.contains('light'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('light')) {
      html.classList.remove('light');
      setIsDark(false);
      // 保存主题状态到 localStorage
      localStorage.setItem('ai-tracker-theme', 'dark');
    } else {
      html.classList.add('light');
      setIsDark(true);
      // 保存主题状态到 localStorage
      localStorage.setItem('ai-tracker-theme', 'light');
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <svg style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isDark ? (
          // 太阳图标 - 浅色模式
          <>
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </>
        ) : (
          // 月亮图标 - 深色模式
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        )}
      </svg>
    </button>
  );
}

// PC端专用的主题切换按钮组件
function DesktopThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // 检查当前主题
    const html = document.documentElement;
    setIsDark(html.classList.contains('light'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('light')) {
      html.classList.remove('light');
      setIsDark(false);
      // 保存主题状态到 localStorage
      localStorage.setItem('ai-tracker-theme', 'dark');
    } else {
      html.classList.add('light');
      setIsDark(true);
      // 保存主题状态到 localStorage
      localStorage.setItem('ai-tracker-theme', 'light');
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <svg style={{ width: '1rem', height: '1rem', color: '#6b7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isDark ? (
          // 太阳图标 - 浅色模式
          <>
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </>
        ) : (
          // 月亮图标 - 深色模式
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        )}
      </svg>
    </button>
  );
}

interface UnifiedMenuProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
  categories?: string[];
  showCategoryFilter?: boolean;
}

export default function UnifiedMenu({
  searchTerm,
  onSearchChange,
  onCategoryChange,
  selectedCategory = '全部',
  categories = ['全部', 'AI技术', 'AI应用', '投资', '医疗AI', '自动驾驶', '量子计算'],
  showCategoryFilter = true
}: UnifiedMenuProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 初始化主题状态
  useEffect(() => {
    // 从 localStorage 恢复主题状态
    const savedTheme = localStorage.getItem('ai-tracker-theme');
    const html = document.documentElement;
    
    if (savedTheme === 'light') {
      html.classList.add('light');
      setIsLightTheme(true);
    } else {
      html.classList.remove('light');
      setIsLightTheme(false);
    }
    
    // 监听DOM变化
    const observer = new MutationObserver(() => {
      const html = document.documentElement;
      setIsLightTheme(html.classList.contains('light'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 头部 */}
      <header style={{ 
        backgroundColor: getColor.bgCard(isLightTheme), 
        borderBottom: `1px solid ${getColor.border(isLightTheme)}`,
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '80rem', 
          margin: '0 auto', 
          padding: isMobile ? '1rem' : '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* 左侧：Logo/标题 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            {isMobile ? (
              <Link href="/" style={{
                textDecoration: 'none',
                color: getColor.text(isLightTheme)
              }}>
                <h1 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: getColor.text(isLightTheme),
                  margin: 0,
                  cursor: 'pointer'
                }}>
                  AI Tracker
                </h1>
              </Link>
            ) : (
              <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href="/" style={{ 
                  textDecoration: 'none', 
                  color: getColor.textSecondary(isLightTheme),
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'color 0.2s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = getColor.primary();
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = getColor.textSecondary(isLightTheme);
                }}>
                  <span>AI Daily</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: getColor.textMuted(isLightTheme),
                    fontWeight: '400',
                    marginTop: '-0.125rem'
                  }}>
                    每日AI新闻
                  </span>
                </Link>
                <Link href="/AI-Tracker" style={{ 
                  textDecoration: 'none', 
                  color: getColor.textSecondary(isLightTheme),
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'color 0.2s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = getColor.primary();
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = getColor.textSecondary(isLightTheme);
                }}>
                  <span>AI Tracker</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: getColor.textMuted(isLightTheme),
                    fontWeight: '400',
                    marginTop: '-0.125rem'
                  }}>
                    AI 更新追踪
                  </span>
                </Link>
              </nav>
            )}
          </div>

          {/* 右侧：功能区域 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* 搜索框 - 仅桌面端显示 */}
            {!isMobile && (
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="搜索新闻..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{
                    width: '300px',
                    padding: '0.75rem 1rem',
                    paddingLeft: '2.5rem',
                    border: `1px solid ${getColor.border(isLightTheme)}`,
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: getColor.bgSearch(isLightTheme),
                    color: getColor.textSecondary(isLightTheme)
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = getColor.borderFocus();
                    e.target.style.boxShadow = '0 0 0 3px rgba(90,169,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = getColor.border(isLightTheme);
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1rem',
                  height: '1rem',
                  color: getColor.textMuted(isLightTheme)
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            {/* RSS订阅按钮 - 仅桌面端显示 */}
            {!isMobile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: `1px solid ${getColor.border(isLightTheme)}`,
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = getColor.hover(isLightTheme);
                  e.currentTarget.style.borderColor = getColor.borderHover(isLightTheme);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = getColor.border(isLightTheme);
                }}
              >
                <svg style={{ width: '1rem', height: '1rem', color: getColor.textMuted(isLightTheme) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            )}

            {/* 主题切换按钮 - 仅桌面端显示 */}
            {!isMobile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: `1px solid ${getColor.border(isLightTheme)}`,
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = getColor.hover(isLightTheme);
                  e.currentTarget.style.borderColor = getColor.borderHover(isLightTheme);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = getColor.border(isLightTheme);
                }}
              >
                <DesktopThemeToggle />
              </div>
            )}

            {/* 汉堡菜单按钮 - 仅移动端显示 */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: '#374151',
                  margin: '2px 0',
                  transition: 'all 0.3s ease-in-out',
                  transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                }} />
                <div style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: '#374151',
                  margin: '2px 0',
                  transition: 'all 0.3s ease-in-out',
                  opacity: mobileMenuOpen ? '0' : '1'
                }} />
                <div style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: '#374151',
                  margin: '2px 0',
                  transition: 'all 0.3s ease-in-out',
                  transform: mobileMenuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none'
                }} />
              </button>
            )}
          </div>
        </div>

        {/* 移动端展开菜单 */}
        {isMobile && mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: getColor.bgCard(isLightTheme),
            borderTop: `1px solid ${getColor.border(isLightTheme)}`,
            boxShadow: isLightTheme ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            zIndex: 40
          }}>
            {/* 搜索框 */}
            <div style={{
              padding: '1rem',
              borderBottom: `1px solid ${getColor.border(isLightTheme)}`
            }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="搜索新闻..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: `1px solid ${getColor.border(isLightTheme)}`,
                    borderRadius: '9999px',
                    fontSize: '1rem',
                    outline: 'none',
                    backgroundColor: getColor.bgSearch(isLightTheme),
                    color: getColor.textSecondary(isLightTheme)
                  }}
                />
                <svg style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1rem',
                  height: '1rem',
                  color: getColor.textMuted(isLightTheme)
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 导航菜单 */}
            <div style={{
              padding: '1rem'
            }}>
              <nav style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <Link href="/test-news" style={{
                  textDecoration: 'none',
                  color: getColor.textSecondary(isLightTheme),
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  padding: '0.75rem 0',
                  borderBottom: `1px solid ${getColor.border(isLightTheme)}`,
                  transition: 'color 0.2s ease-in-out',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => setMobileMenuOpen(false)}>
                  <span>AI Daily</span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: getColor.textMuted(isLightTheme),
                    fontWeight: '400'
                  }}>
                    每日AI新闻
                  </span>
                </Link>
                <Link href="/brief" style={{
                  textDecoration: 'none',
                  color: getColor.textSecondary(isLightTheme),
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  padding: '0.75rem 0',
                  transition: 'color 0.2s ease-in-out',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => setMobileMenuOpen(false)}>
                  <span>AI Tracker</span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: getColor.textMuted(isLightTheme),
                    fontWeight: '400'
                  }}>
                    AI 更新追踪
                  </span>
                </Link>
              </nav>

              {/* RSS订阅按钮和主题切换按钮 */}
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${getColor.border(isLightTheme)}`,
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                {/* RSS订阅按钮 */}
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'transparent',
                  color: getColor.textMuted(isLightTheme),
                  border: `1px solid ${getColor.border(isLightTheme)}`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = getColor.hover(isLightTheme);
                  e.currentTarget.style.borderColor = getColor.borderHover(isLightTheme);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = getColor.border(isLightTheme);
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>

                {/* 主题切换按钮 - 使用移动端专用组件 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${getColor.border(isLightTheme)}`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = getColor.hover(isLightTheme);
                  e.currentTarget.style.borderColor = getColor.borderHover(isLightTheme);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = getColor.border(isLightTheme);
                }}>
                  <MobileThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 分类筛选 - 仅在桌面端显示且启用时 */}
      {!isMobile && showCategoryFilter && onCategoryChange && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '3rem',
          padding: '2rem 0'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedCategory === category ? getColor.primary() : 'transparent',
                  color: selectedCategory === category ? 'white' : getColor.textCaption(isLightTheme),
                  border: selectedCategory === category ? `1px solid ${getColor.primary()}` : `1px solid ${getColor.border(isLightTheme)}`,
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = getColor.hover(isLightTheme);
                    e.currentTarget.style.borderColor = getColor.borderHover(isLightTheme);
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = selectedCategory === category ? getColor.primary() : getColor.border(isLightTheme);
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
