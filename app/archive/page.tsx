'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { ThemeToggle } from '../components/ThemeToggle';

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

/* 浅色模式下的背景渐变调整 */
.light body{
  background:
    radial-gradient(1200px 600px at 80% -100px, rgba(38,103,255,.08), transparent 60%),
    radial-gradient(900px 600px at -10% -50px, rgba(26,166,183,.06), transparent 60%),
    var(--bg);
}
.wrap{max-width:900px; margin:40px auto; padding:0 16px}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:24px;}
.title{font-size:28px; font-weight:700; margin:0; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:14px; margin:0}
.btn-icon{display:flex; align-items:center; justify-content:center; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:8px; cursor:pointer; transition:all 0.2s ease}
.btn-icon:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.btn-icon svg{width:16px; height:16px; color:var(--brand)}
.grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px}
.item{border:1px solid var(--border); background:var(--panel); padding:14px; border-radius:12px; text-decoration:none; color:inherit; transition:all 0.2s ease; box-shadow:var(--shadow)}
.item:hover{transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,.15); border-color:var(--brand)}
.item .date{font-weight:700; color:var(--text)}
.item .desc{opacity:.7; font-size:12px; margin-top:4px; color:var(--muted)}
.back{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8}
.back:hover{opacity:1}

/* 响应式样式 */
@media (max-width: 600px){
  .wrap{padding:0 12px}
  .title{font-size:24px}
  .subtitle{font-size:13px}
  .grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:8px}
  .item{padding:12px}
  .btn-icon{width:36px; height:36px}
}
`;

export default function ArchivePage(){
  const { themeLight } = useTheme();
  const [dates, setDates] = useState<string[]>([]);

  useEffect(()=>{ fetch('/api/dates').then(r=>r.json()).then(d=>setDates(d.dates||[])); },[]);

  function fmtDate(d:string){
    const dt=new Date(d);
    const y=dt.getFullYear(); const m=String(dt.getMonth()+1).padStart(2,'0'); const day=String(dt.getDate()).padStart(2,'0');
    const wd=['日','一','二','三','四','五','六'][dt.getDay()];
    return `${y}年${m}月${day}日（周${wd}）`;
  }

  return (
    <div className={themeLight ? 'light' : ''}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="wrap">
        <header>
          <div>
            <h1 className="title">简报归档</h1>
            <div className="subtitle">从最近到最早 · 点击进入某天</div>
          </div>
          <ThemeToggle />
        </header>
        
        <div className="grid">
          {dates.map(d=>(
            <a key={d} href={`/brief/${d}`} className="item">
              <div className="date">{d}</div>
              <div className="desc">{fmtDate(d)} →</div>
            </a>
          ))}
        </div>
        
        <div style={{marginTop: 24, textAlign: 'center'}}>
          <a href="/" className="back">← 返回首页</a>
        </div>
      </div>
    </div>
  );
}