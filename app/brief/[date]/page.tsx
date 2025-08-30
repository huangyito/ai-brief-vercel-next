'use client';

import { useEffect, useState } from 'react';
import UnifiedMenu from '../../components/UnifiedMenu';
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
.wrap{max-width:1100px; margin:40px auto; padding:0 16px}
.brief-header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:24px;}
.title{font-size:28px; font-weight:700; margin:0; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:16px; margin:8px 0 0}
.theme-toggle{display:flex; align-items:center; gap:8px; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:8px 12px; cursor:pointer; transition:all 0.2s ease; color:var(--text)}
.theme-toggle:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.theme-toggle .icon{width:16; height:16; color:var(--brand)}
.theme-toggle .text{font-size:13px; font-weight:600}
.back{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8; padding:8px 12px; border:1px solid var(--border); border-radius:8px; background:var(--panel)}
.back:hover{opacity:1; transform:translateY(-1px)}
.grid{display:grid; gap:12px; margin-top:18px}
.item{border:1px solid var(--border); background:var(--panel); border-radius:12px; padding:16px; box-shadow:var(--shadow); transition:all 0.2s ease}
.item:hover{transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,.15); border-color:var(--brand)}
.item .header{font-weight:700; display:flex; align-items:center; gap:8px; margin-bottom:8px}
.item .type{font-size:12px; opacity:.7; padding:4px 8px; background:var(--chip); border-radius:999px; border:1px solid var(--border)}
.item .summary{opacity:.85; margin-top:6px; line-height:1.6}
.footer{font-size:11px; opacity:.7; margin-top:24px; text-align:center; color:var(--muted); display:flex: justify-content:center; align-items:center; gap:16px; flex-wrap:wrap}
`;

export default function BriefByDate({ params }: { params: Promise<{ date: string }> }){
  const [date, setDate] = useState<string>('');
  const [searchTerm] = useState('');
  const [isLightTheme, setIsLightTheme] = useState(false);
  
  useEffect(() => {
    params.then(({ date }) => setDate(date));
  }, [params]);
  
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
  
  const [data, setData] = useState<any>(null);

  useEffect(()=>{ fetch(`/api/brief/${date}`).then(r=>r.json()).then(setData); },[date]);

  if (!data) return <div style={{padding:20}}>加载中…</div>;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: getColor.bg(isLightTheme),
      transition: 'background-color 0.3s ease'
    }}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      
      {/* 导航栏 */}
      <UnifiedMenu 
        searchTerm={searchTerm}
        onSearchChange={() => {}}
        showCategoryFilter={false}
      />
      
      <div className="wrap">
        <div className="brief-header">
          <div>
            <h1 className="title">简报 · {date}</h1>
            <div className="subtitle">{data.headline || '—'}</div>
          </div>
        </div>
        
        <div className="grid">
          {data.items?.map((it:any, i:number)=>(
            <div key={i} className="item">
              <div className="header">
                <span>{it.product}</span>
                <span className="type">[{String(it.type).toUpperCase()}]</span>
              </div>
              <div className="summary">{it.summary}</div>
            </div>
          ))}
        </div>
        
        <UnifiedFooter />
        
        <div style={{marginTop: 24, textAlign: 'center'}}>
          <a href="/archive" className="back">← 返回归档</a>
        </div>
      </div>
    </div>
  );
}

