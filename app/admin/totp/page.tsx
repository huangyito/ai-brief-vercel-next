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

.wrap{max-width:800px; margin:48px auto; padding:0 20px; background:var(--bg)}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:32px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:28px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:16px; margin-top:8px}

.back-link{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8; padding:8px; border:1px solid var(--border); border-radius:12px; background:var(--panel); transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; min-width:36px; height:36px}
.back-link:hover{opacity:1; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}

.totp-card{border:1px solid var(--border); background:var(--panel); border-radius:var(--radius); box-shadow:var(--shadow); padding:32px; margin-bottom:24px}
.totp-card h3{margin:0 0 16px; font-size:20px; color:var(--text)}
.totp-card p{color:var(--muted); font-size:14px; margin:0 0 20px; line-height:1.6}

.btn{appearance:none; border:1px solid var(--border); background:var(--brand); color:white; padding:12px 24px; border-radius:8px; cursor:pointer; transition:all 0.2s ease; font-weight:600; font-size:16px; margin-right:12px}
.btn:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.btn:disabled{opacity:0.6; cursor:not-allowed; transform:none}
.btn.secondary{background:var(--panel-2); color:var(--text); border-color:var(--border)}
.btn.danger{background:var(--bad); border-color:var(--bad)}
.btn.small{padding:8px 16px; font-size:14px}

.step-list{list-style:none; padding:0; margin:24px 0}
.step-list li{display:flex; align-items:flex-start; gap:16px; margin-bottom:20px}
.step-number{width:32px; height:32px; background:var(--brand); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; flex-shrink:0}
.step-content h4{margin:0 0 8px; font-size:16px; color:var(--text)}
.step-content p{color:var(--muted); font-size:14px; margin:0; line-height:1.6}

.qr-section{display:flex; flex-direction:column; align-items:center; gap:20px; margin:32px 0}
.qr-code{width:200px; height:200px; border:1px solid var(--border); border-radius:12px; padding:16px; background:white}
.secret-display{background:var(--panel-2); border:1px solid var(--border); border-radius:8px; padding:12px; font-family:monospace; font-size:14px; color:var(--text); word-break:break-all}
.otpauth-url{background:var(--panel-2); border:1px solid var(--border); border-radius:8px; padding:12px; font-family:monospace; font-size:12px; color:var(--muted); word-break:break-all; max-width:400px}

.actions{margin-top:24px; display:flex; gap:12px; flex-wrap:wrap}
`;

export default function TOTPPage() {
  const [loading, setLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [totpConfig, setTotpConfig] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
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

  const handleSetupTOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/totp', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        setSetupResult(result);
      }
    } catch (error) {
      console.error('设置TOTP失败:', error);
    }
    setLoading(false);
  };

  const handleDisableTOTP = async () => {
    if (!confirm('确定要禁用TOTP吗？这将降低账户安全性。')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/totp', { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setTotpConfig({ ...totpConfig, enabled: false });
      }
    } catch (error) {
      console.error('禁用TOTP失败:', error);
    }
    setLoading(false);
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
              <h1 className="title">TOTP动态口令</h1>
              <div className="subtitle">配置双因素认证，提升账户安全性</div>
            </div>
          </div>
          <Link href="/admin" className="back-link" title="返回管理后台">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
        </header>

        {/* 设置TOTP */}
        {!totpConfig?.enabled && !setupResult && (
          <div className="totp-card">
            <h3>启用TOTP</h3>
            <p>TOTP（基于时间的一次性密码）是一种双因素认证方式，为您的账户提供额外的安全保护。</p>
            
            <div className="actions">
              <button onClick={handleSetupTOTP} className="btn" disabled={loading}>
                {loading ? '设置中...' : '启用TOTP'}
              </button>
            </div>
          </div>
        )}

        {/* 配置结果 */}
        {setupResult && (
          <div className="totp-card">
            <h3>配置成功！</h3>
            <p>请按照以下步骤完成TOTP配置：</p>
            
            <ol className="step-list">
              <li>
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>扫描二维码</h4>
                  <p>使用Google Authenticator、Microsoft Authenticator等TOTP应用扫描下方二维码</p>
                </div>
              </li>
              <li>
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>手动输入密钥（可选）</h4>
                  <p>如果无法扫描二维码，可以手动输入密钥</p>
                </div>
              </li>
              <li>
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>测试验证</h4>
                  <p>在应用中生成动态口令，确保配置正确</p>
                </div>
              </li>
            </ol>

            <div className="qr-section">
              <div className="qr-code">
                <img src={setupResult.config?.qrCode} alt="TOTP二维码" style={{width: '100%', height: 'auto'}} />
              </div>
              
              <div>
                <button 
                  onClick={() => setShowSecret(!showSecret)} 
                  className="btn secondary small"
                  style={{marginBottom: '12px'}}
                >
                  {showSecret ? '隐藏密钥' : '显示密钥'}
                </button>
                
                {showSecret && (
                  <div className="secret-display">
                    {setupResult.config?.secret}
                  </div>
                )}
              </div>
              
              <div className="otpauth-url">
                {setupResult.config?.otpauthUrl}
              </div>
            </div>

            <div className="actions">
              <button onClick={() => setSetupResult(null)} className="btn secondary">
                完成配置
              </button>
            </div>
          </div>
        )}

        {/* 禁用TOTP */}
        {totpConfig?.enabled && (
          <div className="totp-card">
            <h3>禁用TOTP</h3>
            <p>禁用TOTP后，将不再需要动态口令验证，但会降低账户安全性。</p>
            
            <div className="actions">
              <button onClick={handleDisableTOTP} className="btn danger" disabled={loading}>
                {loading ? '禁用中...' : '禁用TOTP'}
              </button>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="totp-card">
          <h3>使用说明</h3>
          <p>TOTP（基于时间的一次性密码）是一种双因素认证方式，提供额外的安全保护：</p>
          
          <ul style={{color: 'var(--muted)', lineHeight: '1.6', paddingLeft: '20px'}}>
            <li>每次登录都需要输入动态口令</li>
            <li>动态口令每30秒自动更新</li>
            <li>支持"记住该设备"功能，避免重复输入</li>
            <li>即使密码泄露，账户仍然安全</li>
          </ul>
          
          <p style={{marginTop: '16px', color: 'var(--warn)'}}>
            <strong>注意：</strong>请妥善保管TOTP应用，不要将密钥分享给他人。
          </p>
        </div>

        <UnifiedFooter content="TOTP动态口令配置 · 仅限管理员访问" />
      </div>
    </div>
  );
}
