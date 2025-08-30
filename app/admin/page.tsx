'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UnifiedFooter from '../components/UnifiedFooter';
import { getColor } from '../utils/themeColors';

const styles = `
:root{
  --bg:#1c1c1e; --panel:#2c2c2e; --panel-2:#3a3a3c; --text:#ffffff; --muted:#8e8e93;
  --brand:#5aa9ff; --accent:#7ef0ff; --ok:#63f3a6; --warn:#ffd166; --bad:#ff6b6b; --chip:#3a3a3c;
  --border:#38383a;
  --shadow:0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03);
  --radius:0.75rem;
}
.light{ --bg:#f7f9fc; --panel:#ffffff; --panel-2:#f0f3f9; --text:#0f1624; --muted:#5b6780; --brand:#5aa9ff; --accent:#1aa6b7; --chip:#e9eef7; --border:#e5e7eb; --shadow:0 10px 28px rgba(16,34,64,.08), inset 0 1px 0 rgba(255,255,255,.6); }
*{box-sizing:border-box}
html,body{height:100%}

html{background:var(--bg)}

body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,PingFang SC,"Microsoft YaHei",Helvetica,Arial,"Noto Sans",sans-serif;
  overflow-x: hidden;
}

.wrap{max-width:80rem; margin:0 auto; padding:2rem 1rem; background:var(--bg)}
header{display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:3rem; padding:0 1rem;}
.brand{display:flex; align-items:center; gap:1rem}
.logo{width:3rem; height:3rem; border-radius:0.75rem; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 4px 12px rgba(90,169,255,0.15); position:relative; isolation:isolate;}
.title{font-size:2.25rem; font-weight:700; color:var(--text)}
.subtitle{color:var(--muted); font-size:1.125rem; margin-top:0.5rem; font-weight:300}

.back-link{color:var(--brand); text-decoration:none; font-size:0.875rem; padding:0.5rem 1rem; border:1px solid var(--border); border-radius:9999px; background:transparent; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; cursor:pointer}
.back-link:hover{background-color:var(--panel-2); border-color:var(--brand); transform:scale(1.02)}

.admin-grid{display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem; margin-top:2rem}
.admin-card{background:var(--panel); border-radius:var(--radius); padding:1.5rem; transition:all 0.2s ease; cursor:pointer; border:2px solid transparent}
.admin-card:hover{transform:scale(1.02); border-color:var(--brand)}
.admin-card h3{margin:0 0 1rem; font-size:1.5rem; color:var(--text); font-weight:600}
.admin-card p{color:var(--muted); margin:0 0 1.5rem; line-height:1.6; font-size:0.875rem}
.admin-card .stats{display:flex; gap:1rem; margin-bottom:1.5rem}
.stat{text-align:center}
.stat .n{font-size:1.5rem; font-weight:700; color:var(--brand)}
.stat .t{font-size:0.75rem; color:var(--muted); margin-top:0.25rem}
.admin-card .actions{display:flex; gap:0.75rem}
.btn{appearance:none; border:none; background:var(--brand); color:white; padding:0.5rem 1rem; border-radius:9999px; cursor:pointer; transition:all 0.2s ease; font-weight:500; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; font-size:0.875rem}
.btn:hover{transform:scale(1.05); box-shadow:0 4px 12px rgba(90,169,255,0.2)}
.btn.secondary{background:transparent; color:var(--text); border:1px solid var(--border)}
.btn.secondary:hover{background-color:var(--panel-2); border-color:var(--brand)}

.btn-icon{display:flex; align-items:center; justify-content:center; background:transparent; border:1px solid var(--border); border-radius:9999px; padding:0.5rem; cursor:pointer; transition:all 0.2s ease}
.btn-icon:hover{background-color:var(--panel-2); border-color:var(--brand); transform:scale(1.05)}
.btn-icon svg{width:1rem; height:1rem; color:var(--brand)}

.footer{margin:4rem 0 2rem; color:var(--muted); font-size:0.875rem; text-align:center; opacity:0.7}
`;

export default function AdminPage() {
  const [modelCount, setModelCount] = useState(0);
  const [pushConfig, setPushConfig] = useState<any>(null);
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

    const handleLogout = async () => {
    if (!confirm('确定要登出吗？')) {
      return;
    }

    try {
      // 获取设备令牌（如果有的话）
      const deviceToken = localStorage.getItem('admin_device_token');
      
      // 调用登出API
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceToken })
      });
      
      // 清除本地存储
      localStorage.removeItem('admin_device_token');
      
      // 重定向到登录页面
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('登出失败:', error);
      alert('登出失败，请重试');
    }
  };

  useEffect(() => {
    // 获取模型数量
    fetch('/api/admin/models')
      .then(res => res.json())
      .then(models => setModelCount(Array.isArray(models) ? models.length : 0))
      .catch(err => console.error('获取模型数量失败:', err));
    
    // 获取推送配置
    fetch('/api/admin/push-config')
      .then(res => res.json())
      .then(config => setPushConfig(config))
      .catch(err => console.error('获取推送配置失败:', err));
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: getColor.bg(isLightTheme),
      transition: 'background-color 0.3s ease'
    }}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      
      <div className="wrap">
        <header>
          <div className="brand">
            <div className="logo"></div>
            <div>
              <h1 className="title">AI简报后台管理</h1>
              <div className="subtitle">管理AI模型和推送配置</div>
            </div>
          </div>
          
          {/* 右上角功能区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: `1px solid ${getColor.border(isLightTheme)}`,
                borderRadius: '9999px',
                padding: '0.5rem',
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
              <button 
                onClick={() => {
                  const html = document.documentElement;
                  if (html.classList.contains('light')) {
                    html.classList.remove('light');
                    localStorage.setItem('ai-tracker-theme', 'dark');
                  } else {
                    html.classList.add('light');
                    localStorage.setItem('ai-tracker-theme', 'light');
                  }
                }}
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
                title={isLightTheme ? '切换到深色模式' : '切换到浅色模式'}
              >
                <svg style={{ width: '1rem', height: '1rem', color: getColor.textMuted(isLightTheme) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isLightTheme ? (
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
            </div>
            <button 
              onClick={handleLogout} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              🚪 登出
            </button>
            <Link 
              href="/" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '400',
                textDecoration: 'none',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ← 返回前台
            </Link>
          </div>
        </header>

        <div className="admin-grid">
          {/* 模型管理卡片 */}
          <div className="admin-card">
            <h3>AI模型管理</h3>
            <p>管理需要关注的AI模型，控制哪些模型相关的新闻会被推送。</p>
            
            <div className="stats">
              <div className="stat">
                <div className="n">{modelCount}</div>
                <div className="t">当前模型</div>
              </div>
            </div>
            
            <div className="actions">
              <Link href="/admin/models" className="btn primary">
                管理模型
              </Link>
            </div>
          </div>

          {/* 推送配置卡片 */}
          <div className="admin-card">
            <h3>推送配置</h3>
            <p>设置每日简报的推送时间和时区，确保在合适的时间推送内容。</p>
            
            <div className="stats">
              <div className="stat">
                <div className="n">{pushConfig?.pushTime || '09:00'}</div>
                <div className="t">推送时间</div>
              </div>
              <div className="stat">
                <div className="n">{pushConfig?.isEnabled ? '启用' : '禁用'}</div>
                <div className="t">自动推送</div>
              </div>
            </div>
            
            <div className="actions">
              <Link href="/admin/settings" className="btn primary">
                配置推送
              </Link>
            </div>
          </div>

          {/* TOTP安全配置卡片 */}
          <div className="admin-card">
            <h3>TOTP动态口令</h3>
            <p>配置双因素认证，提升后台登录安全性，支持扫码配置和设备记住功能。</p>
            
            <div className="stats">
              <div className="stat">
                <div className="n">安全</div>
                <div className="t">双因素认证</div>
              </div>
            </div>
            
            <div className="actions">
              <Link href="/admin/totp" className="btn primary">
                配置TOTP
              </Link>
            </div>
          </div>

          {/* 系统状态卡片 */}
          <div className="admin-card">
            <h3>系统状态</h3>
            <p>查看系统运行状态和最近的操作记录。</p>
            
            <div className="stats">
              <div className="stat">
                <div className="n">正常</div>
                <div className="t">系统状态</div>
              </div>
              <div className="stat">
                <div className="n">今日</div>
                <div className="t">最后推送</div>
              </div>
            </div>
            
            <div className="actions">
              <button className="btn secondary">
                查看日志
              </button>
            </div>
          </div>
        </div>

        <UnifiedFooter content="AI简报后台管理系统 · 仅限管理员访问" />
      </div>
    </div>
  );
}
