'use client';

import { useEffect, useState } from 'react';
import UnifiedFooter from '../../components/UnifiedFooter';
import { getColor } from '../../utils/themeColors';

type Item = { product:string; type:string; summary:string; date?:string };

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
.wrap{max-width:900px; margin:40px auto; padding:0 16px}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:24px;}
.title{font-size:28px; font-weight:700; margin:0; letter-spacing:.3px}
.theme-toggle{display:flex; align-items:center; gap:8px; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:8px 12px; cursor:pointer; transition:all 0.2s ease; color:var(--text)}
.theme-toggle:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.theme-toggle .icon{width:16; height:16; color:var(--brand)}
.theme-toggle .text{font-size:13px; font-weight:600}
.back{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8; padding:8px 12px; border:1px solid var(--border); border-radius:8px; background:var(--panel)}
.back:hover{opacity:1; transform:translateY(-1px)}
.grid{display:grid; gap:12px; margin-top:14px}
.item{border:1px solid var(--border); background:var(--panel); padding:12px; border-radius:12px; text-decoration:none; color:inherit; transition:all 0.2s ease; box-shadow:var(--shadow)}
.item:hover{transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,.15); border-color:var(--brand)}
.item .header{display:flex; justify-content:space-between; align-items:flex-start; gap:12px}
.item .content{font-weight:700; color:var(--text); line-height:1.5}
.item .date{opacity:.7; font-size:12px; color:var(--muted); white-space:nowrap}
.loading{opacity:.7; margin-top:12px; color:var(--muted)}
.empty{opacity:.7; margin-top:12px; color:var(--muted)}
.footer{font-size:11px; opacity:.7; margin-top:24px; text-align:center; color:var(--muted)}
`;

export default function ProductHistory({ params }: { params: Promise<{ product: string }> }){
  const [product, setProduct] = useState<string>('');
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
    params.then(({ product }) => setProduct(decodeURIComponent(product)));
  }, [params]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      const datesRes = await fetch('/api/dates').then(r=>r.json());
      const dates: string[] = datesRes.dates || [];
      const list: Item[] = [];
      // 逐日抓取（可并发）
      await Promise.all(dates.map(async (d)=>{
        const data = await fetch(`/api/brief/${d}`).then(r=>r.json());
        (data.items||[]).forEach((it:any)=>{
          if (it.product === product) list.push({ ...it, date: d });
        });
      }));
      setItems(list);
      setLoading(false);
    })();
  }, [product]);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: getColor.bg(isLightTheme),
      transition: 'background-color 0.3s ease'
    }}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="wrap">
        <header>
          <h1 className="title">{product} · 历史更新</h1>
        </header>
        
        {loading ? (
          <div className="loading">加载中…</div>
        ) : items.length === 0 ? (
          <div className="empty">暂无记录</div>
        ) : (
          <div className="grid">
            {items.map((it, i)=>(
              <a key={i} href={`/brief/${it.date}`} className="item">
                <div className="header">
                  <div className="content">[{String(it.type).toUpperCase()}] {it.summary}</div>
                  <div className="date">{it.date}</div>
                </div>
              </a>
            ))}
          </div>
        )}
        
        <UnifiedFooter content="注：本页面汇总公开来源的更新信息，仅用于学习与研究，不构成任何商业承诺或投资建议。" />
        
        <div style={{marginTop: 24, textAlign: 'center'}}>
          <a href="/archive" className="back">← 返回归档</a>
        </div>
      </div>
    </div>
  );
}

