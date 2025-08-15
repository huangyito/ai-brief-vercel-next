'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const styles = `
:root{
  --bg:#0b0f16; --panel:#0f1624; --panel-2:#121a2a; --text:#e6ecff; --muted:#9fb0cf;
  --brand:#5aa9ff; --accent:#7ef0ff; --ok:#63f3a6; --warn:#ffd166; --bad:#ff6b6b; --chip:#1a2132;
  --border:rgba(255,255,255,.08);
  --shadow:0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03);
  --radius:16px;
}
.light{ --bg:#f7f9fc; --panel:#ffffff; --panel-2:#f0f3f9; --text:#0f1624; --muted:#5b6780; --brand:#2667ff; --accent:#1aa6b7; --chip:#e9eef7; --border:rgba(10,20,30,.08); --shadow:0 10px 28px rgba(16,34,64,.08), inset 0 1px 0 rgba(255,255,255,.6); }
*{box-sizing:border-box}
html,body{height:100%}

html{background:var(--bg)}

body{
  margin:0;
  background:
    radial-gradient(1200px 600px at 80% -100px, rgba(90,169,255,.18), transparent 60%),
    radial-gradient(900px 600px at -10% -50px, rgba(126,240,255,.12), transparent 60%),
    var(--bg);
  color:var(--text);
  font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,PingFang SC,"Microsoft YaHei",Helvetica,Arial,"Noto Sans",sans-serif;
  letter-spacing:.2px;
}

.light html{background:var(--bg)}
.light body{
  background:
    radial-gradient(1200px 600px at 80% -100px, rgba(38,103,255,.08), transparent 60%),
    radial-gradient(900px 600px at -10% -50px, rgba(26,166,183,.06), transparent 60%),
    var(--bg);
}

.wrap{max-width:1200px; margin:48px auto; padding:0 20px; background:var(--bg)}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:32px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:28px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:16px; margin-top:8px}

.back-link{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8; padding:8px 12px; border:1px solid var(--border); border-radius:8px; background:var(--panel); transition:all 0.2s ease}
.back-link:hover{opacity:1; transform:translateY(-1px)}

.admin-grid{display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px; margin-top:32px}
.admin-card{border:1px solid var(--border); background:var(--panel); border-radius:var(--radius); box-shadow:var(--shadow); padding:24px; transition:all 0.2s ease}
.admin-card:hover{transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,.15); border-color:var(--brand)}
.admin-card h3{margin:0 0 16px; font-size:20px; color:var(--text)}
.admin-card p{color:var(--muted); margin:0 0 20px; line-height:1.6}
.admin-card .stats{display:flex; gap:16px; margin-bottom:20px}
.stat{text-align:center}
.stat .n{font-size:24px; font-weight:800; color:var(--brand)}
.stat .t{font-size:12px; color:var(--muted); margin-top:4px}
.admin-card .actions{display:flex; gap:12px}
.btn{appearance:none; border:1px solid var(--border); background:var(--panel-2); color:var(--text); padding:10px 16px; border-radius:12px; cursor:pointer; transition:all 0.2s ease; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; justify-content:center}
.btn:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.btn.primary{background:var(--brand); color:white; border-color:var(--brand)}
.btn.secondary{background:var(--panel-2); color:var(--text); border-color:var(--border)}

.footer{margin:32px 0 60px; color:var(--muted); font-size:11px; text-align:center; opacity:.7}
`;

export default function AdminPage() {
  const [modelCount, setModelCount] = useState(0);
  const [pushConfig, setPushConfig] = useState<any>(null);

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
    <div className="light">
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
          <Link href="/" className="back-link">
            ← 返回前台
          </Link>
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
              <Link href="/admin/models/add" className="btn secondary">
                添加模型
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

        <div className="footer">
          AI简报后台管理系统 · 仅限管理员访问
        </div>
      </div>
    </div>
  );
}
