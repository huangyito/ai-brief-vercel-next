'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { ThemeToggle } from '../components/ThemeToggle';

type Item = {
  product: string;
  type: 'new'|'update'|'feedback'|'fix';
  summary: string;
  tags?: string[];
  sources?: {name:string; url:string}[];
  time?: string;
};
type Brief = { date: string; headline: string; items: Item[]; };

/** —— 产品元信息：名称 + 极简SVG占位LOGO —— */
const PRODUCT_META: Record<string, { label: string; icon: JSX.Element }> = {
  OpenAI: { label: 'OpenAI', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="currentColor"/></svg>
  )},
  Anthropic: { label: 'Anthropic', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor"/></svg>
  )},
  Google: { label: 'Google', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 4a8 8 0 1 0 8 8" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
  )},
  Meta: { label: 'Meta', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 16c2-8 8-8 10 0 2-8 8-8 10 0" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
  )},
  Mistral: { label: 'Mistral', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 12h18M6 8h12M6 16h12" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
  )},
  xAI: { label: 'xAI', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
  )},
  Microsoft: { label: 'Microsoft', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 4h8v8H4zM12 4h8v8h-8zM4 12h8v8H4zM12 12h8v8h-8z" fill="currentColor"/></svg>
  )},
  '百度': { label: '百度', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3" fill="currentColor"/><path d="M5 16h14" stroke="currentColor" strokeWidth="2"/></svg>
  )},
  '阿里': { label: '阿里', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2"/></svg>
  )},
  '字节': { label: '字节', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><rect x="6" y="4" width="3" height="16" fill="currentColor"/><rect x="11" y="4" width="3" height="16" fill="currentColor"/><rect x="16" y="6" width="2" height="12" fill="currentColor"/></svg>
  )},
  '讯飞': { label: '讯飞', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2"/></svg>
  )},
  'Kimi': { label: 'Kimi', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="8" cy="10" r="2" fill="currentColor"/><circle cx="16" cy="10" r="2" fill="currentColor"/></svg>
  )},
};

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

/* 浅色模式下的背景渐变调整 */
.light html{background:var(--bg)}
.light body{
  background:
    radial-gradient(1200px 600px at 80% -100px, rgba(38,103,255,.08), transparent 60%),
    radial-gradient(900px 600px at -10% -50px, rgba(26,166,183,.06), transparent 60%),
    var(--bg);
}
.wrap{max-width:1100px; margin:48px auto; padding:0 20px; background:var(--bg)}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:22px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:13px}
.actions{display:flex; gap:8px; flex-wrap:wrap}
@media (max-width: 600px){.actions{gap:6px; flex-wrap:wrap; justify-content:space-between} .btn{padding:8px 12px; font-size:13px; flex:1; min-width:0; text-align:center}}
.btn{appearance:none; border:1px solid var(--border); background:var(--panel-2); color:var(--text); padding:8px 12px; border-radius:12px; cursor:pointer; transition:all 0.2s ease; font-weight:600; text-decoration:none}
.btn:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)} .btn:active{transform:translateY(0)}

.theme-toggle{display:flex; align-items:center; gap:8px; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:8px 12px; cursor:pointer; transition:all 0.2s ease}
.theme-toggle:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.theme-toggle .icon{width:16; height:16; color:var(--brand)}
.theme-toggle .text{font-size:13px; font-weight:600}

.hero-content{display:grid; grid-template-columns: 1.2fr .8fr; gap:18px; align-items:start; margin-bottom:18px}

.hero-header{display:flex; align-items:center; justify-content:space-between; margin-bottom:6px}
.hero-actions{display:flex; gap:8px; align-items:center}
.btn-icon{display:flex; align-items:center; justify-content:center; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:8px; cursor:pointer; transition:all 0.2s ease; color:var(--text); min-width:40px; min-height:40px}
.btn-icon:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.btn-icon svg{width:16px; height:16px; color:var(--brand)}
.hero h1{margin:0 0 6px; font-size:28px; letter-spacing:.2px}
.update-time{color:var(--muted); font-size:13px; margin-bottom:8px; opacity:.8}
.hero p{margin:0; color:var(--muted)}
.date{font-feature-settings:"tnum" 1, "cv01" 1; opacity:.9}
.kpis{display:flex; gap:12px; margin-top:12px; flex-wrap:wrap}
.kpi{flex:1; min-width:0; border:1px solid var(--border); background:var(--panel-2); border-radius:14px; padding:12px; text-align:center}
.kpi .n{font-size:20px; font-weight:800} .kpi .t{font-size:11px; color:var(--muted)}
@media (max-width: 600px){.kpis{gap:8px} .kpi{padding:10px} .kpi .n{font-size:18px} .kpi .t{font-size:10px}}

.grid{display:grid; grid-template-columns:repeat(12,1fr); gap:16px; margin-top:18px}
.col-8{grid-column:span 8} .col-4{grid-column:span 4}
@media (max-width: 900px){.hero-content{grid-template-columns:1fr}.col-8,.col-4{grid-column:1 / -1}}
@media (max-width: 600px){.wrap{padding:0 16px; margin:32px auto} header{margin-bottom:16px; flex-direction:column; align-items:flex-start; gap:16px} .hero-content{grid-template-columns:1fr; gap:16px} .hero h1{font-size:24px} .title{font-size:20px} .brand{gap:10px} .logo{width:36px; height:36px} .actions{justify-content:space-between; width:100%; gap:8px} .hero-header{flex-direction:column; align-items:flex-start; gap:12px} .bottom-actions{flex-direction:column; align-items:center; gap:8px}}
@media (max-width: 480px){.actions{gap:4px} .btn{padding:6px 10px; font-size:12px}}

.card{border:1px solid var(--border); background:var(--panel); border-radius:var(--radius); box-shadow:var(--shadow)}
.card h3{margin:0; font-size:16px}
.card .hd{display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px dashed var(--border)}
.card .bd{padding:10px 8px 14px}

.feed{display:flex; flex-direction:column; gap:10px}
.item{display:grid; grid-template-columns: 24px 1fr auto; gap:12px; padding:10px 10px; border-radius:12px; border:1px solid transparent}
.item:hover{border-color:var(--border); background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0))}
.ico{width:24px; height:24px; display:grid; place-items:center; border-radius:8px; background:var(--chip);}
.chg{display:inline-flex; align-items:center; gap:6px; font-size:12px; padding:4px 8px; border-radius:999px; border:1px solid var(--border); background:var(--chip)}
.prod{font-weight:700} .desc{color:var(--muted)}
.tags{display:flex; gap:6px; flex-wrap:wrap}
.tag{font-size:11px; color:var(--muted); padding:4px 8px; border-radius:999px; border:1px solid var(--border); background:var(--chip)}
.meta{display:flex; align-items:center; gap:10px; color:var(--muted); font-size:12px}
.sources{display:flex; gap:8px; flex-wrap:wrap}
.src{font-size:12px; color:var(--brand); text-decoration:none; border-bottom:1px dashed rgba(90,169,255,.4)}

.filterbar{display:flex; gap:8px; flex-wrap:wrap}
.pill{padding:8px 12px; border-radius:999px; background:var(--panel-2); border:1px solid var(--border); cursor:pointer; font-size:13px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s ease; color:var(--text)}
@media (max-width: 600px){.filterbar{gap:6px} .pill{padding:6px 10px; font-size:12px}}
.pill:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.pill.active{background:var(--brand); color:white; border-color:var(--brand); box-shadow:0 0 0 1px var(--brand) inset}
.pill.toggle-more{background:var(--muted); color:var(--text); border-color:var(--muted); opacity:0.8}
.pill.toggle-more:hover{background:var(--brand); color:white; border-color:var(--brand); opacity:1}

.bottom-actions{display:flex; gap:12px; justify-content:center; margin:32px 0 20px}
.bottom-actions .btn{min-width:140px}

.footer{margin:26px 0 60px; color:var(--muted); font-size:11px; text-align:center; opacity:.7}
.note{opacity:.8} .divider{height:1px; background:linear-gradient(90deg, transparent, var(--border), transparent); margin:10px 0}
`;

function iconByType(t:string){
  const m:any = {
    new: '<path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    update: '<path d="M3 12a9 9 0 1 0 9-9v3M3 6v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    feedback: '<path d="M20 15a7 7 0 1 0-13.86 2H3l3.5 3.5A7 7 0 0 0 20 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    fix: '<path d="M3 21l6-6M7 21l-4-4M14 3l7 7-8 8H6v-7l8-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  };
  return m[t] ?? m.update;
}
function colorByType(t:string){
  const m:any = { new:'var(--accent)', update:'var(--brand)', feedback:'var(--warn)', fix:'var(--ok)'};
  return m[t] || 'var(--brand)';
}
function fmtDate(d:string){
  const dt=new Date(d);
  const y=dt.getFullYear(); const m=String(dt.getMonth()+1).padStart(2,'0'); const day=String(dt.getDate()).padStart(2,'0');
  const wd=['日','一','二','三','四','五','六'][dt.getDay()];
  return `${y}年${m}月${day}日（周${wd}）`;
}

export default function Page(){
  const { themeLight } = useTheme();
  const [brief, setBrief] = useState<Brief|null>(null);
  const [filter, setFilter] = useState<string>('全部');
  const [showAllModels, setShowAllModels] = useState(false);

  useEffect(()=>{ fetch('/api/brief').then(r=>r.json()).then(setBrief); },[]);

  const products = useMemo(()=> brief ? Array.from(new Set(brief.items.map(i=>i.product))) : [], [brief]);
  const items = useMemo(()=>{
    if (!brief) return [];
    const all = brief.items;
    return filter==='全部'? all : all.filter(i=>i.product===filter);
  }, [brief, filter]);

  if (!brief) return <div style={{padding:20}}>加载中…</div>;

  const counts = brief.items.reduce((acc:any,it)=>{acc[it.type]=(acc[it.type]||0)+1; return acc;},{} as Record<string,number>);
  const total = brief.items.length;
  const allSources = new Map<string,string>();
  brief.items.forEach(it=> (it.sources||[]).forEach(s=> allSources.set(s.url, s.name)) );

  // 顶部导航：增加「归档」入口
  const Nav = () => (
    <div className="actions">
      <a className="btn" href="/archive">归档</a>
      <button className="btn" onClick={()=>{
        const lines = [`## ${fmtDate(brief.date)} AI 产品每日简报`, `**要点**：${brief.headline}`, '', ...brief.items.map(it=>`- **${it.product}** [${it.type.toUpperCase()}] ${it.summary}`)];
        navigator.clipboard.writeText(lines.join('\n'));
      }}>复制为 Markdown</button>
      <button className="btn" onClick={()=>{
        const blob = new Blob([document.documentElement.outerHTML], {type:'text/html;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `AI-brief-${brief.date?.replace(/-/g,'')}.html`; a.click(); URL.revokeObjectURL(url);
      }}>导出 HTML</button>
      <ThemeToggle />
    </div>
  );

  return (
    <div className={themeLight ? 'light' : ''}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="wrap">
        <header>
          <div className="brand">
            <div className="logo" aria-hidden="true"></div>
          </div>
        </header>

        <div className="hero-content">
          <div>
            <div className="hero-header">
              <h1>今日要点</h1>
              <div className="hero-actions">
                <button className="btn-icon" onClick={() => window.open('/archive', '_blank')} title="查看档案">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
                    <path d="M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H8z"/>
                  </svg>
                </button>
                <ThemeToggle />
              </div>
            </div>
            <div className="update-time">{fmtDate(brief.date||new Date().toISOString())}</div>
            <div className="kpis" style={{marginTop:12}}>
              {[{n: total, t:'今日条目'},{n: counts.new||0, t:'新发布'},{n: counts.update||0, t:'功能更新'},{n: counts.feedback||0, t:'反馈'},{n: counts.fix||0, t:'修复'}]
                .map((k,i)=>(<div className="kpi" key={i}><div className="n">{k.n}</div><div className="t">{k.t}</div></div>))}
            </div>
          </div>

          <div className="card" style={{padding:'14px'}}>
            {/* ✅ 简化的筛选器 */}
            <div className="filterbar">
              <button
                className={`pill ${filter==='全部'?'active':''}`}
                onClick={()=>setFilter('全部')}
                title="筛选：全部"
              >
                全部
              </button>
              {products.slice(0, showAllModels ? products.length : 3).map(p=> (
                <button
                  key={p}
                  className={`pill ${filter===p?'active':''}`}
                  onClick={()=>setFilter(p)}
                  data-prod={p}
                  title={`筛选：${p}`}
                >
                  {p}
                </button>
              ))}
              {products.length > 3 && (
                <button
                  className="pill toggle-more"
                  onClick={() => setShowAllModels(!showAllModels)}
                  title={showAllModels ? "收起" : "显示更多"}
                >
                  {showAllModels ? "收起" : `+${products.length - 3}个`}
                </button>
              )}
            </div>
            <div className="divider"></div>
            <div className="tags">
              <span className="tag">NEW 新发布</span>
              <span className="tag">UPDATE 功能更新</span>
              <span className="tag">FEEDBACK 市场/用户反馈</span>
              <span className="tag">FIX 修复与回滚</span>
            </div>
          </div>
        </div>

        <section className="grid">
          <div className="col-8">
            <div className="card">
              <div className="hd"><h3>今日变更日志</h3><div className="meta">{total} 项更新 · 可按产品筛选</div></div>
              <div className="bd">
                <div className="feed">
                  {items.map((it,idx)=> (
                    <div className="item" key={idx}>
                      <div className="ico" style={{color: colorByType(it.type)}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{__html: iconByType(it.type)}}/>
                      </div>
                      <div>
                        <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4}}>
                          <span className="prod">{it.product}</span>
                          <span className="chg" data-type={it.type}>{it.type.toUpperCase()}</span>
                        </div>
                        <div className="desc">{it.summary}</div>
                        <div className="tags" style={{marginTop:8}}>
                          {(it.tags||[]).map((t,i)=>(<span className="tag" key={i}>{t}</span>))}
                        </div>
                      </div>
                      <div className="meta">{(it.time||'').slice(0,10)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="card">
              <div className="hd"><h3>来源与参考</h3><a className="btn" href="/archive">查看归档</a></div>
              <div className="bd">
                <div className="sources">
                  {Array.from(allSources).map(([url,name])=> (<a className="src" key={url} href={url} target="_blank" rel="noreferrer noopener">{name}</a>))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ 底部操作按钮 */}
        <div className="bottom-actions">
          <button className="btn" onClick={()=>{
            const lines = [`## ${fmtDate(brief.date)} AI 产品每日简报`, `**要点**：${brief.headline}`, '', ...brief.items.map(it=>`- **${it.product}** [${it.type.toUpperCase()}] ${it.summary}`)];
            navigator.clipboard.writeText(lines.join('\n'));
          }}>复制为 Markdown</button>
          <button className="btn" onClick={()=>{
            const blob = new Blob([document.documentElement.outerHTML], {type:'text/html;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `AI-brief-${brief.date?.replace(/-/g,'')}.html`; a.click(); URL.revokeObjectURL(url);
          }}>导出 HTML</button>
        </div>

        {/* ✅ 页脚注脚（很小的字） */}
        <div className="footer">
          注：本页面自动汇总公开来源的更新信息，每天早上9点更新，仅用于学习与研究，不构成任何商业承诺或投资建议。
        </div>
      </div>
    </div>
  );
}