'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../../components/ThemeProvider';
import { ThemeToggle } from '../../components/ThemeToggle';

type Item = { product:string; type:string; summary:string; date?:string };

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

export default function ProductHistory({ params }: { params: { product: string } }){
  const { themeLight } = useTheme();
  const product = decodeURIComponent(params.product);
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
    <div className={themeLight ? 'light' : ''}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="wrap">
        <header>
          <h1 className="title">{product} · 历史更新</h1>
          <ThemeToggle />
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
        
        <div className="footer">
          注：汇总公开来源，仅用于学习研究。
        </div>
        
        <div style={{marginTop: 24, textAlign: 'center'}}>
          <a href="/archive" className="back">← 返回归档</a>
        </div>
      </div>
    </div>
  );
}

