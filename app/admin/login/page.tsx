'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UnifiedFooter from '../../components/UnifiedFooter';
import { getColor } from '../../utils/themeColors';

const styles = `
:root{
  --bg:#1c1c1e; --panel:#2c2c2e; --panel-2:#3a3a3c; --text:#ffffff; --muted:#8e8e93;
  --brand:#5aa9ff; --accent:#7ef0ff; --ok:#63f3a6; --warn:#ffd166; --bad:#ff6b6b; --chip:#3a3a3c;
  --border:#38383a;
  --shadow:0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03);
  --radius:16px;
}
.light{ --bg:#f7f9fc; --panel:#ffffff; --panel-2:#f0f3f9; --text:#0f1624; --muted:#5b6780; --brand:#5aa9ff; --accent:#1aa6b7; --chip:#e9eef7; --border:#e5e7eb; --shadow:0 10px 28px rgba(16,34,64,.08), inset 0 1px 0 rgba(255,255,255,.6); }
*{box-sizing:border-box}
html,body{height:100%}

html{background:var(--bg)}

body{
  margin:0;
  background:
    radial-gradient(800px 400px at 50% -100px, rgba(90,169,255,.12), transparent 70%),
    radial-gradient(600px 400px at 50% -50px, rgba(126,240,255,.08), transparent 70%),
    var(--bg);
  color:var(--text);
  font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,PingFang SC,"Microsoft YaHei",Helvetica,Arial,"Noto Sans",sans-serif;
  letter-spacing:.2px;
  overflow-x: hidden;
}

.light html{background:var(--bg)}
.light body{
  background:
    radial-gradient(800px 400px at 50% -100px, rgba(38,103,255,.06), transparent 70%),
    radial-gradient(600px 400px at 50% -50px, rgba(26,166,183,.04), transparent 70%),
    var(--bg);
  overflow-x: hidden;
}

.wrap{max-width:400px; margin:48px auto; padding:0 20px; background:var(--bg)}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:32px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:28px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:16px; margin-top:8px}

.back-link{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8; padding:8px; border:1px solid var(--border); border-radius:12px; background:var(--panel); transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; min-width:36px; height:36px}
.back-link:hover{opacity:1; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}

.login-form{border:1px solid var(--border); background:var(--panel); border-radius:var(--radius); box-shadow:var(--shadow); padding:32px}
.form-group{margin-bottom:20px}
.form-group label{display:block; margin-bottom:8px; font-weight:600; color:var(--text)}
.form-group input{width:100%; padding:12px 16px; border:1px solid var(--border); border-radius:8px; background:var(--panel-2); color:var(--text); font-size:16px; box-sizing:border-box}
.form-group input:focus{outline:none; border-color:var(--brand); box-shadow:0 0 0 3px rgba(90,169,255,.1)}
.form-group .checkbox{display:flex; align-items:center; gap:8px; margin-top:12px}
.form-group .checkbox input{width:auto; margin:0}

.btn{appearance:none; border:1px solid var(--border); background:var(--brand); color:white; padding:12px 24px; border-radius:8px; cursor:pointer; transition:all 0.2s ease; font-weight:600; font-size:16px; width:100%; margin-top:8px}
.btn:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.btn:disabled{opacity:0.6; cursor:not-allowed; transform:none}
.btn.secondary{background:var(--panel-2); color:var(--text); border-color:var(--border)}

.error-message{background:var(--bad); color:white; padding:12px; border-radius:8px; margin-bottom:20px; font-size:14px}
.success-message{background:var(--ok); color:white; padding:12px; border-radius:8px; margin-bottom:20px; font-size:14px}

.totp-section{margin-top:20px; padding-top:20px; border-top:1px solid var(--border)}
.totp-section h4{margin:0 0 12px; font-size:16px; color:var(--text)}
.totp-section p{color:var(--muted); font-size:14px; margin:0 0 16px}

.footer{margin:32px 0 60px; color:var(--muted); font-size:11px; text-align:center; opacity:.7}
`;

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTOTP, setShowTOTP] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
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
    // 检查是否已有设备令牌
    const deviceToken = localStorage.getItem('admin_device_token');
    if (deviceToken) {
      verifyDeviceToken(deviceToken);
    }
    
    // 检查TOTP是否启用
    checkTOTPStatus();
  }, []);

  const checkTOTPStatus = async () => {
    try {
      const response = await fetch('/api/admin/totp');
      const data = await response.json();
      setTotpEnabled(data.enabled);
    } catch (error) {
      console.error('检查TOTP状态失败:', error);
    }
  };

  const verifyDeviceToken = async (deviceToken: string) => {
    try {
      const response = await fetch('/api/admin/totp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceToken })
      });
      
      const data = await response.json();
      if (data.success) {
        // 设备令牌有效，直接跳转到管理页面
        window.location.href = '/admin';
      } else {
        // 设备令牌无效，清除本地存储
        localStorage.removeItem('admin_device_token');
      }
    } catch (error) {
      console.error('验证设备令牌失败:', error);
      localStorage.removeItem('admin_device_token');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    // 这里应该调用实际的登录API
    // 为了演示，我们使用简单的验证
    if (username === 'admin' && password === 'admin123') {
      if (totpEnabled) {
        setShowTOTP(true);
        setSuccess('用户名密码正确，请输入动态口令');
      } else {
        // 没有启用TOTP，生成一个临时的设备令牌并登录成功
        const tempDeviceToken = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('admin_device_token', tempDeviceToken);
        handleLoginSuccess();
      }
    } else {
      setError('用户名或密码错误');
    }
  };

  const handleTOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!totpToken) {
      setError('请输入动态口令');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/totp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: totpToken,
          rememberDevice 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        if (rememberDevice && data.deviceToken) {
          localStorage.setItem('admin_device_token', data.deviceToken);
        }
        handleLoginSuccess();
      } else {
        setError(data.error || '动态口令验证失败');
      }
    } catch (error) {
      console.error('TOTP验证失败:', error);
      setError('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setSuccess('登录成功，正在跳转...');
    setTimeout(() => {
      window.location.href = '/admin';
    }, 1000);
  };

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
              <h1 className="title">后台登录</h1>
              <div className="subtitle">AI简报管理系统</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: `1px solid ${getColor.border(isLightTheme)}`,
                borderRadius: '12px',
                padding: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '36px',
                height: '36px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getColor.hover(isLightTheme);
                e.currentTarget.style.borderColor = getColor.borderHover(isLightTheme);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = getColor.border(isLightTheme);
              }}
              title={isLightTheme ? '切换到深色模式' : '切换到浅色模式'}
            >
              <svg style={{ width: '16px', height: '16px', color: getColor.textMuted(isLightTheme) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <Link href="/" className="back-link">
              ← 返回前台
            </Link>
          </div>
        </header>

        <div className="login-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!showTOTP ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                />
              </div>
              
              <button type="submit" className="btn" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          ) : (
            <div>
              <div className="totp-section">
                <h4>动态口令验证</h4>
                <p>请输入您的TOTP应用生成的6位动态口令</p>
                
                <form onSubmit={handleTOTPVerification}>
                  <div className="form-group">
                    <label htmlFor="totp">动态口令</label>
                    <input
                      id="totp"
                      type="text"
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <div className="checkbox">
                      <input
                        type="checkbox"
                        id="rememberDevice"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                      />
                      <label htmlFor="rememberDevice">记住该设备（30天内无需再次输入动态口令）</label>
                    </div>
                  </div>
                  
                  <button type="submit" className="btn" disabled={loading}>
                    {loading ? '验证中...' : '验证'}
                  </button>
                </form>
                
                <button 
                  onClick={() => setShowTOTP(false)} 
                  className="btn secondary"
                  style={{marginTop: '12px'}}
                >
                  返回用户名密码
                </button>
              </div>
            </div>
          )}
        </div>

        <UnifiedFooter content="AI简报后台管理系统 · 安全登录" />
      </div>
    </div>
  );
}
