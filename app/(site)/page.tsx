'use client';

import { useEffect, useMemo, useState } from 'react';

type Item = {
  product: string;
  type: 'new'|'update'|'feedback'|'fix';
  summary: string;
  tags?: string[];
  sources?: {name:string; url:string}[];
  time?: string;
}
type Brief = {
  date: string;
  headline: string;
  items: Item[];
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
body{margin:0; background:radial-gradient(1200px 600px at 80% -100px, rgba(90,169,255,.18), transparent 60%), radial-gradient(900px 600px at -10% -50px, rgba(126,240,255,.12), transparent 60%), var(--bg); color:var(--text); font:16px/1.65 system-ui, -apple-system, Segoe UI, Roboto, PingFang SC, "Microsoft YaHei", Helvetica, Arial, "Noto Sans", sans-serif; letter-spacing:.2px;}
.wrap{max-width:1100px; margin:48px auto; padding:0 20px}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:22px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:13px}
.actions{display:flex; gap:8px}
.btn{appearance:none; border:1px solid var(--border); background:var(--panel); color:var(--text); padding:10px 14px; border-radius:12px; cursor:pointer; box-shadow:var(--shadow); font-weight:600}
.btn:hover{transform:translateY(-1px)} .btn:active{transform:translateY(0)}
.hero{border:1px solid var(--border); background:linear-gradient(180deg, rgba(90,169,255,.08), transparent 50%), var(--panel); padding:18px; border-radius:var(--radius); box-shadow:var(--shadow); display:grid; grid-template-columns: 1.2fr .8fr; gap:18px; align-items:center; overflow:hidden;}
.hero h1{margin:0 0 6px; font-size:28px; letter-spacing:.2px} .hero p{margin:0; color:var(--muted)}
.date{font-feature-settings:"tnum" 1, "cv01" 1; opacity:.9}
.kpis{display:flex; gap:12px; flex-wrap:wrap; margin-top:12px}
.kpi{flex:1; min-width:160px; border:1px solid var(--border); background:var(--panel-2); border-radius:14px; padding:14px}
.kpi .n{font-size:22px; font-weight:800} .kpi .t{font-size:12px; color:var(--muted)}
.grid{display:grid; grid-template-columns:repeat(12,1fr); gap:16px; margin-top:18px}
.col-8{grid-column:span 8} .col-4{grid-column:span 4}
@media (max-width: 900px){.hero{grid-template-columns:1fr}.col-8,.col-4{grid-column:1 / -1}}
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
.pill{padding:8px 10px; border-radius:999px; background:var(--chip); border:1px solid var(--border); cursor:pointer; font-size:13px}
.pill.active{box-shadow:0 0 0 1px var(--brand) inset; color:var(--brand)}
.footer{margin:26px 0 60px; color:var(--muted); font-size:12px; text-align:center}
.note{opacity:.8} .divider{height:1px; background:linear-gradient(90deg, transparent, var(--border), transparent); margin:10px 0}
`;

function icon(t:string){
  const m:any = {
    new: '<path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    update: '<path d="M3 12a9 9 0 1 0 9-9v3M3 6v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    feedback: '<path d="M20 15a7 7 0 1 0-13.86 2H3l3.5 3.5A7 7 0 0 0 20 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    fix: '<path d="M3 21l6-6M7 21l-4-4M14 3l7 7-8 8H6v-7l8-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  };
  return m[t] ?? m.update;
}
function color(t:string){
  const m:any = { new:'var(--accent)', update:'var(--brand)', feedback:'var(--warn)', fix:'var(--ok)'};
  return m[t] || 'var(--brand)';
}
function fmtDate(d:string){ const dt=new Date(d); const y=dt.getFullYear(); const m=String(dt.getMonth()+1).padStart(2,'0'); const day=String(dt.getDate()).padStart(2,'0'); const wd=['日','一','二','三','四','五','六'][dt.getDay()]; return `${y}年${m}月${day}日（周${wd}）`; }

export default function Page(){
  const [brief, setBrief] = useState<Brief|null>(null);
  const [themeLight, setThemeLight] = useState(false);
  const [filter, setFilter] = useState<string>('全部');

  useEffect(()=>{ fetch('/api/brief').then(r=>r.json()).then(setBrief); },[]);

  const products = useMemo(()=> brief ? Array.from(new Set(brief.items.map(i=>i.product))) : [], [brief]);
  const items = useMemo(()=>{
    if (!brief) return [];
    const all = brief.items;
    return filter==='全部'? all : all.filter(i=>i.product===filter);
  }, [brief, filter]);

  if (!brief) return <div style={{padding:20}}>加载中…</div>;

  const counts = brief.items.reduce((acc:any,it)=>{acc[it.type]=(acc[it.type]||0)+1; return acc;},{});
  const total = brief.items.length;
  const allSources = new Map<string,string>();
  brief.items.forEach(it=> (it.sources||[]).forEach(s=> allSources.set(s.url, s.name)) );

  return (
    <div className={themeLight ? 'light' : ''}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="wrap">
        <header>
          <div className="brand">
            <div className="logo" aria-hidden="true"></div>
            <div>
              <div className="title">AI 产品每日简报</div>
              <div className="subtitle"><span className="date">{fmtDate(brief.date||new Date().toISOString())}</span> · 自动生成 · 科技感样式</div>
            </div>
          </div>
          <div className="actions">
            <button className="btn" onClick={()=>setThemeLight(v=>!v)}>切换主题</button>
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
        </header>

        <section className="hero">
          <div>
            <h1>今日要点 · <span>{brief.headline || '—'}</span></h1>
            <p className="note">聚焦第一梯队：OpenAI / Anthropic / Google / Meta / Mistral / xAI / Microsoft / 百度 / 阿里 / 字节 / 讯飞 / Kimi。</p>
            <div className="kpis">
              {[
                {n: total, t:'今日条目'},
                {n: counts.new||0, t:'新发布 NEW'},
                {n: counts.update||0, t:'功能更新 UPDATE'},
                {n: counts.feedback||0, t:'反馈 FEEDBACK'},
                {n: counts.fix||0, t:'修复 FIX'},
              ].map((k,i)=>(<div className="kpi" key={i}><div className="n">{k.n}</div><div className="t">{k.t}</div></div>))}
            </div>
          </div>
          <div className="card" style={{padding:'14px'}}>
            <div className="filterbar">
              {['全部', ...products].map(p=> (
                <button key={p} className={`pill ${filter===p?'active':''}`} onClick={()=>setFilter(p)} data-prod={p}>{p}</button>
              ))}
            </div>
            <div className="divider"></div>
            <div className="tags">
              <span className="tag">NEW 新发布</span>
              <span className="tag">UPDATE 功能更新</span>
              <span className="tag">FEEDBACK 市场/用户反馈</span>
              <span className="tag">FIX 修复与回滚</span>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="col-8">
            <div className="card">
              <div className="hd"><h3>今日变更日志</h3><div className="meta">{total} 项更新 · 可按产品筛选</div></div>
              <div className="bd">
                <div className="feed">
                  {items.map((it,idx)=> (
                    <div className="item" key={idx}>
                      <div className="ico" style={{color: color(it.type)}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{__html: icon(it.type)}}/>
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
            <div className="card" style={{marginBottom:16}}>
              <div className="hd"><h3>来源与参考</h3></div>
              <div className="bd">
                <div className="sources">
                  {Array.from(allSources).map(([url,name])=> (<a className="src" key={url} href={url} target="_blank" rel="noreferrer noopener">{name}</a>))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="hd"><h3>使用说明</h3></div>
              <div className="bd">
                <ol style={{margin:'0 0 8px 18px', padding:0}}>
                  <li>本页从 <code>/api/brief</code> 读取当日简报 JSON。</li>
                  <li>后端由 Vercel Cron 每天 9:00 JST 生成并写入 KV。</li>
                  <li>可复制 Markdown 或导出 HTML；打印自动优化。</li>
                </ol>
                <div className="note">如需自定义品牌色/Logo，请修改样式变量或插入图片。</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
