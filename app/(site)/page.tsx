'use client';

import React, { useState, useEffect } from 'react';
import UnifiedMenu from '../components/UnifiedMenu';
import UnifiedFooter from '../components/UnifiedFooter';
import { getColor } from '../utils/themeColors';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl?: string;
  featured?: boolean;
  source: string;
  sourceUrl: string;
}

// 模拟新闻数据
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'OpenAI发布GPT-4 Turbo，性能大幅提升',
    excerpt: 'OpenAI今日发布了GPT-4 Turbo模型，相比之前的版本，新模型在理解能力、推理速度和准确性方面都有显著提升。',
    category: 'AI技术',
    date: '2024-01-15',
    readTime: '3分钟',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop&crop=center',
    source: 'OpenAI官方',
    sourceUrl: 'https://openai.com'
  },
  {
    id: '2',
    title: 'ChatGPT移动应用下载量突破1亿',
    excerpt: 'ChatGPT移动应用在各大应用商店的下载量已经突破1亿次，成为最受欢迎的AI聊天应用之一。',
    category: 'AI应用',
    date: '2024-01-14',
    readTime: '2分钟',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com'
  },
  {
    id: '3',
    title: '微软投资OpenAI 100亿美元',
    excerpt: '微软宣布向OpenAI投资100亿美元，这是AI领域有史以来最大的一笔投资，将加速AI技术的发展。',
    category: '投资',
    date: '2024-01-13',
    readTime: '4分钟',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop&crop=center',
    source: '微软官方',
    sourceUrl: 'https://microsoft.com'
  },
  {
    id: '4',
    title: 'AI在医疗诊断中的应用突破',
    excerpt: '最新研究显示，AI在医疗影像诊断中的准确率已经达到95%以上，为医疗行业带来了革命性的变化。',
    category: '医疗AI',
    date: '2024-01-12',
    readTime: '5分钟',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center',
    source: 'Nature',
    sourceUrl: 'https://nature.com'
  },
  {
    id: '5',
    title: '自动驾驶技术最新进展',
    excerpt: '特斯拉、Waymo等公司在自动驾驶技术方面取得重大突破，L4级别自动驾驶即将实现商业化。',
    category: '自动驾驶',
    date: '2024-01-11',
    readTime: '6分钟',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center',
    source: 'Tesla官方',
    sourceUrl: 'https://tesla.com'
  },
  {
    id: '6',
    title: '量子计算在AI领域的应用',
    excerpt: '量子计算与AI的结合正在开启新的可能性，有望解决传统计算无法处理的复杂问题。',
    category: '量子计算',
    date: '2024-01-10',
    readTime: '7分钟',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop&crop=center',
    source: 'IBM Research',
    sourceUrl: 'https://research.ibm.com'
  }
];

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 过滤新闻
  const filteredNews = MOCK_NEWS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 无限滚动
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        if (!loading && displayCount < filteredNews.filter(item => !item.featured).length) {
          setLoading(true);
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + 3, filteredNews.filter(item => !item.featured).length));
            setLoading(false);
          }, 1000);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, displayCount, filteredNews]);

  // 动态注入搜索框样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .search-input::placeholder {
        color: ${isLightTheme ? '#9ca3af' : '#8e8e93'} !important;
        opacity: 0.6 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isLightTheme]);

  const categories = ['全部', 'AI技术', 'AI应用', '投资', '医疗AI', '自动驾驶', '量子计算'];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: getColor.bg(isLightTheme),
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      transition: 'background-color 0.3s ease'
    }}>
      {/* 统一菜单组件 */}
      <UnifiedMenu
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
        categories={categories}
        showCategoryFilter={true}
      />

      {/* 主要内容 */}
      <main style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: isMobile ? '1rem' : '2rem'
      }}>
        {/* 页面标题声明 - 缩短上下间距 */}
        <div style={{
          textAlign: 'center', 
          marginTop: isMobile ? '0.5rem' : '1rem',
          marginBottom: '0.5rem'
        }}>
          <h1 style={{ 
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 'bold',
            color: getColor.text(isLightTheme),
            margin: '0 0 0.25rem 0',
            letterSpacing: '-0.025em'
          }}>
            AI Daily
          </h1>
          <p style={{ 
            fontSize: isMobile ? '1rem' : '1.25rem',
            color: getColor.textMuted(isLightTheme),
            fontWeight: '400',
            margin: '0 0 0.5rem 0',
            opacity: '0.8'
          }}>
            每日AI新闻头条 · 智能科技前沿动态
          </p>
        </div>

        {/* 更新时间 - 缩短上下间距 */}
        <div style={{
          textAlign: 'center', 
          marginTop: '0',
          marginBottom: '1rem'
        }}>
          <p style={{ 
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            color: getColor.textMuted(isLightTheme),
            fontWeight: '300',
            lineHeight: '1.2',
            margin: 0,
            opacity: '0.7'
          }}>
            新闻更新时间：{new Date().toLocaleDateString('zh-CN')} · {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* 特色新闻 */}
        {filteredNews.filter(item => item.featured).length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '1.5rem',
              width: '100%'
            }}>
              {filteredNews
                .filter(item => item.featured)
                .map((item) => (
                  <article 
                    key={item.id} 
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{ 
                      backgroundColor: hoveredCard === item.id ? getColor.hover(isLightTheme) : getColor.bgCard(isLightTheme),
                      borderRadius: '0.75rem', 
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transform: hoveredCard === item.id ? 'scale(1.02)' : 'scale(1)',
                      border: hoveredCard === item.id ? '2px solid #5aa9ff' : '2px solid transparent',
                      transition: 'all 0.2s ease-in-out',
                      flex: '1 1 0',
                      minWidth: '0',
                      width: '100%'
                    }}
                  >
                    {/* 头图 */}
                    <div style={{ 
                      width: '100%',
                      aspectRatio: isMobile ? '1/1' : '21/9',
                      backgroundColor: getColor.bgPlaceholder(isLightTheme), 
                      overflow: 'hidden'
                    }}>
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            backgroundColor: getColor.bgPlaceholder(isLightTheme)
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextSibling as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      {/* 占位符 */}
                      <div style={{ 
                        display: item.imageUrl ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        backgroundColor: getColor.bgPlaceholder(isLightTheme), 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <div style={{ 
                          color: getColor.textMuted(isLightTheme), 
                          fontSize: '0.875rem',
                          textAlign: 'center',
                          padding: '0.5rem'
                        }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📰</div>
                          <div style={{ fontSize: '0.75rem' }}>图片</div>
                        </div>
                      </div>
                    </div>

                    {/* 内容 */}
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.75rem' 
                      }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '500', 
                          backgroundColor: getColor.tagBg(isLightTheme), 
                          color: getColor.tagText(isLightTheme) 
                        }}>
                          {item.category}
                        </span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: getColor.textMuted(isLightTheme) 
                        }}>{item.date}</span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: getColor.textMuted(isLightTheme) 
                        }}>·</span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: getColor.textMuted(isLightTheme) 
                        }}>{item.readTime}</span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: getColor.textMuted(isLightTheme) 
                        }}>·</span>
                        <a 
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.75rem',
                            color: getColor.textMuted(isLightTheme),
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.2s ease-in-out'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#5aa9ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = getColor.textMuted(isLightTheme);
                          }}
                        >
                          来源自·{item.source}
                        </a>
                      </div>
                      <h3 style={{ 
                        fontSize: isMobile ? '1.125rem' : '1.25rem', 
                        fontWeight: '600', 
                        color: getColor.text(isLightTheme), 
                        marginBottom: '0.75rem',
                        lineHeight: '1.4',
                        height: isMobile ? '2.8rem' : 'auto',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.title}
                      </h3>
                      {/* 移动端不显示内容，PC端显示 */}
                      {!isMobile && (
                        <p style={{ 
                          color: getColor.textBody(isLightTheme),
                          lineHeight: '1.6',
                          fontSize: '0.875rem'
                        }}>
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </div>
        )}

        {/* 最新消息 */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: getColor.text(isLightTheme), 
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {selectedCategory === '全部' ? '最新消息' : `${selectedCategory}消息`}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap: isMobile ? '1rem' : '1.5rem'
          }}>
            {filteredNews
              .filter(item => !item.featured)
              .slice(0, displayCount)
              .map((item) => (
                <article 
                  key={item.id} 
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    backgroundColor: hoveredCard === item.id ? getColor.hover(isLightTheme) : getColor.bgCard(isLightTheme),
                    borderRadius: '0.75rem', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transform: hoveredCard === item.id ? 'scale(1.02)' : 'scale(1)',
                    border: hoveredCard === item.id ? '2px solid #5aa9ff' : '2px solid transparent',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {/* 简化的左右布局：图片 + 内容 */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    width: '100%',
                    height: isMobile ? '80px' : '160px'
                  }}>
                    {/* 头图 - 左侧 */}
                    <div style={{ 
                      width: isMobile ? '80px' : '160px',
                      minWidth: isMobile ? '80px' : '160px',
                      height: isMobile ? '80px' : '160px',
                      backgroundColor: getColor.bgPlaceholder(isLightTheme), 
                      overflow: 'hidden',
                      borderRadius: '0.5rem'
                    }}>
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            backgroundColor: getColor.bgPlaceholder(isLightTheme)
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextSibling as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      {/* 占位符 */}
                      <div style={{ 
                        display: item.imageUrl ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        backgroundColor: getColor.bgPlaceholder(isLightTheme), 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <div style={{ 
                          color: getColor.textMuted(isLightTheme), 
                          fontSize: '0.875rem',
                          textAlign: 'center',
                          padding: '0.5rem'
                        }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📰</div>
                          <div style={{ fontSize: '0.75rem' }}>图片</div>
                        </div>
                      </div>
                    </div>

                    {/* 内容 - 右侧 */}
                    <div style={{ 
                      padding: '0 1.25rem',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: isMobile ? '80px' : '160px'
                    }}>
                      {/* 标题 */}
                      <h3 style={{ 
                        fontSize: isMobile ? '1rem' : '1.125rem', 
                        fontWeight: '600', 
                        color: getColor.text(isLightTheme), 
                        marginTop: isMobile ? '0.75rem' : '1.25rem',
                        marginBottom: '0.25rem',
                        lineHeight: '1.3',
                        height: isMobile ? '2.6rem' : '1.4625rem',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.title}
                      </h3>
                       
                      {/* PC端内容描述 */}
                      {!isMobile && (
                        <p style={{ 
                          color: getColor.textBody(isLightTheme),
                          lineHeight: '1.5',
                          fontSize: '0.875rem',
                          height: '2.625rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          marginBottom: '0'
                        }}>
                          {item.excerpt}
                        </p>
                      )}
                       
                      {/* 元数据信息 - 在标题下方 */}
                       <div style={{ 
                        marginTop: 'auto',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem',
                          flexWrap: isMobile ? 'nowrap' : 'wrap'
                        }}>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            padding: '0.125rem 0.375rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.625rem', 
                            fontWeight: '500', 
                            backgroundColor: getColor.tagBg(isLightTheme), 
                            color: getColor.tagText(isLightTheme) 
                          }}>
                            {item.category}
                          </span>
                          <span style={{ 
                            fontSize: '0.625rem', 
                            color: getColor.textMuted(isLightTheme) 
                          }}>{item.date}</span>
                          <span style={{ 
                            fontSize: '0.625rem', 
                            color: getColor.textMuted(isLightTheme) 
                          }}>·</span>
                          {/* 移动端不显示阅读时间，PC端显示 */}
                          {!isMobile && (
                            <>
                              <span style={{ 
                                fontSize: '0.625rem', 
                                color: getColor.textMuted(isLightTheme) 
                              }}>{item.readTime}</span>
                              <span style={{ 
                                fontSize: '0.625rem', 
                                color: getColor.textMuted(isLightTheme) 
                              }}>·</span>
                            </>
                          )}
                          <a 
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.625rem',
                              color: getColor.textMuted(isLightTheme),
                              textDecoration: 'none',
                              cursor: 'pointer',
                              transition: 'color 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#5aa9ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = getColor.textMuted(isLightTheme);
                            }}
                          >
                            来源自·{item.source}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              width: '2rem',
              height: '2rem',
              border: `3px solid ${getColor.bgPlaceholder(isLightTheme)}`,
              borderTop: '3px solid #5aa9ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: getColor.textMuted(isLightTheme) }}>正在加载更多消息...</p>
          </div>
        )}

        {/* 加载完成提示 */}
        {!loading && displayCount >= filteredNews.filter(item => !item.featured).length && filteredNews.filter(item => !item.featured).length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: getColor.textMuted(isLightTheme) }}>已显示全部消息</p>
          </div>
        )}

        {/* 空状态 */}
        {filteredNews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <svg style={{ margin: '0 auto', height: '3rem', width: '3rem', color: getColor.textMuted(isLightTheme) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: getColor.text(isLightTheme) }}>没有找到相关新闻</h3>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: getColor.textMuted(isLightTheme) }}>尝试调整搜索条件或选择其他分类。</p>
          </div>
        )}
      </main>

      {/* 统一脚注组件 */}
      <UnifiedFooter content="© 2024 AI简报系统. 这是一个测试页面，用于展示新闻头条栏目的设计。" />

      {/* 加载动画样式 */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
