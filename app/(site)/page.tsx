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
.btn:hover{transform:translateY(-1px)} .btn:active{transform:translateY(0)}



.hero-content{display:block; margin-bottom:18px}

.hero-header{display:flex; align-items:center; justify-content:space-between; margin-bottom:6px}
.hero-title{display:flex; align-items:center; gap:14px}
.hero-title .logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate}
.hero-title .logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.hero-actions{display:flex; gap:8px; align-items:center}
.btn-icon{display:flex; align-items:center; justify-content:center; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:8px; cursor:pointer; transition:all 0.2s ease; color:var(--text); width:40px; height:40px}
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
@media (max-width: 900px){.col-8,.col-4{grid-column:1 / -1}}
@media (max-width: 600px){.wrap{padding:0 16px; margin:32px auto} .hero h1{font-size:24px} .hero-title .logo{width:36px; height:36px} .hero-title{gap:10px} .bottom-actions{flex-direction:row; align-items:center; gap:8px; justify-content:center} .bottom-actions .btn{min-width:120px; max-width:200px}}
@media (max-width: 480px){.actions{gap:4px} .btn{padding:6px 10px; font-size:12px} .hero-header{gap:8px} .hero-actions{gap:6px} .btn-icon{width:36px; height:36px} .bottom-actions{gap:6px} .bottom-actions .btn{min-width:100px; max-width:160px}}

.card{border:1px solid var(--border); background:var(--panel); border-radius:var(--radius); box-shadow:var(--shadow)}
.card-no-border{border:none; background:transparent; box-shadow:none}
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
@media (max-width: 600px){.bottom-actions{gap:8px; flex-wrap:wrap; justify-content:center} .bottom-actions .btn{min-width:100px; max-width:120px; font-size:13px; padding:8px 12px}}
@media (max-width: 480px){.bottom-actions{gap:6px} .bottom-actions .btn{min-width:90px; max-width:110px; font-size:12px; padding:6px 10px}

/* 预览模态框样式 */
.preview-modal{position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px}
.preview-content{background:var(--panel); border-radius:16px; padding:20px; max-width:90vw; max-height:90vh; overflow:auto; position:relative; box-shadow:0 20px 40px rgba(0,0,0,0.3)}
.preview-close{position:absolute; top:10px; right:15px; background:none; border:none; font-size:24px; cursor:pointer; color:var(--text); z-index:1; width:40px; height:40px; border-radius:20px; display:flex; align-items:center; justify-content:center; transition:all 0.2s ease}
.preview-close:hover{background:var(--panel-2); transform:scale(1.1)}
.preview-image{width:100%; height:auto; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.2)}
.preview-actions{margin-top:15px; text-align:center}}

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(()=>{ fetch('/api/brief').then(r=>r.json()).then(setBrief); },[]);

  // 图片生成函数
  const generateImage = (isPreview: boolean = false) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 800;
      canvas.height = 1200;
      
      // 设置主题颜色
      const colors = themeLight ? {
        bg: '#f7f9fc',
        text: '#0f1624',
        muted: '#5b6780',
        brand: '#2667ff'
      } : {
        bg: '#0b0f16',
        text: '#e6ecff',
        muted: '#9fb0cf',
        brand: '#5aa9ff'
      };
      
      // 设置背景
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制标题
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AI 产品每日简报', canvas.width / 2, 80);
      
      // 绘制日期
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText(fmtDate(brief?.date || new Date().toISOString()), canvas.width / 2, 130);
      
      // 绘制要点
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.text;
      ctx.fillText('今日要点', canvas.width / 2, 200);
      
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      const headline = brief?.headline || '今日要点';
      const maxWidth = canvas.width - 80;
      if (ctx.measureText(headline).width > maxWidth) {
        const words = headline.split('');
        let line = '';
        let y = 250;
        for (let char of words) {
          if (ctx.measureText(line + char).width > maxWidth) {
            ctx.fillText(line, canvas.width / 2, y);
            line = char;
            y += 40;
          } else {
            line += char;
          }
        }
        if (line) ctx.fillText(line, canvas.width / 2, y);
      } else {
        ctx.fillText(headline, canvas.width / 2, 250);
      }
      
      // 绘制统计信息
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.text;
      ctx.fillText('今日统计', canvas.width / 2, 350);
      
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      const statsText = `条目: ${brief?.items.length || 0} | 新发布: ${counts?.new || 0} | 更新: ${counts?.update || 0}`;
      ctx.fillText(statsText, canvas.width / 2, 380);
      
      // 绘制项目列表
      let yPos = 450;
      const maxItems = 8;
      (brief?.items || []).slice(0, maxItems).forEach((item, index) => {
        // 绘制产品名称和类型
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.brand;
        ctx.textAlign = 'left';
        ctx.fillText(`${item.product} [${item.type.toUpperCase()}]`, 60, yPos);
        
        // 绘制项目描述
        ctx.font = '20px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.text;
        const maxDescWidth = canvas.width - 120;
        let desc = item.summary;
        if (ctx.measureText(desc).width > maxDescWidth) {
          desc = desc.substring(0, 50) + '...';
        }
        ctx.fillText(desc, 60, yPos + 30);
        
        yPos += 60;
      });
      
      // 绘制二维码
      const qrSize = 120;
      const qrX = canvas.width / 2 - qrSize / 2;
      const qrY = canvas.height - 200;
      
      // 绘制二维码背景
      ctx.fillStyle = colors.bg === '#0b0f16' ? '#ffffff' : '#f0f0f0';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      
      // 绘制二维码（基于SVG数据）
      const qrRectangles = [
        {x: 0, y: 0}, {x: 12, y: 0}, {x: 24, y: 0}, {x: 36, y: 0}, {x: 48, y: 0}, {x: 60, y: 0}, {x: 72, y: 0}, {x: 84, y: 0}, {x: 96, y: 0}, {x: 120, y: 0}, {x: 168, y: 0}, {x: 192, y: 0}, {x: 204, y: 0}, {x: 228, y: 0}, {x: 276, y: 0}, {x: 288, y: 0}, {x: 300, y: 0}, {x: 312, y: 0}, {x: 336, y: 0}, {x: 348, y: 0}, {x: 360, y: 0}, {x: 372, y: 0}, {x: 384, y: 0}, {x: 396, y: 0}, {x: 408, y: 0}
      ];
      
      const scale = qrSize / 432;
      ctx.fillStyle = colors.bg === '#0b0f16' ? '#000000' : '#333333';
      qrRectangles.forEach(rect => {
        ctx.fillRect(
          qrX + rect.x * scale + 10,
          qrY + rect.y * scale + 10,
          scale * 12 - 1,
          scale * 12 - 1
        );
      });
      
      // 绘制二维码说明文字
      ctx.font = '20px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText('Scan to visit', canvas.width / 2, qrY + qrSize + 40);
      
      // 绘制版权信息
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      ctx.fillText('由 Haynes Fang 设计并搭建', canvas.width / 2, canvas.height - 40);
      
      if (isPreview) {
        // 预览模式：显示图片
        const imageData = canvas.toDataURL('image/png');
        setPreviewImage(imageData);
        setShowPreview(true);
      } else {
        // 导出模式：下载图片
        const link = document.createElement('a');
        link.download = `AI-brief-${brief?.date?.replace(/-/g,'') || 'preview'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('生成图片失败:', error);
      alert('生成图片失败，请稍后重试');
    }
  };

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
      <button className="btn" onClick={() => generateImage(true)}>预览图片</button>
      <button className="btn" onClick={() => generateImage(false)}>导出为图片</button>
      <ThemeToggle />
    </div>
  );

  return (
    <div className={themeLight ? 'light' : ''}>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="wrap">
        <div className="hero-content">
          <div>
            <div className="hero-header">
              <div className="hero-title">
                <div className="logo" aria-hidden="true"></div>
                <h1>今日要点</h1>
              </div>
              <div className="hero-actions">
                <a className="btn-icon" href="/archive" title="查看归档">
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                    <rect x="6" y="6" width="36" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                    <path d="M4 31H15L17 35H31L33 31H44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M42 36V26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 36V26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 15H31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 23H31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <ThemeToggle />
              </div>
            </div>
            <div className="update-time">{fmtDate(brief.date||new Date().toISOString())}</div>
            <div className="kpis" style={{marginTop:12}}>
              {[{n: total, t:'今日条目'},{n: counts.new||0, t:'新发布'},{n: counts.update||0, t:'功能更新'},{n: counts.feedback||0, t:'反馈'},{n: counts.fix||0, t:'修复'}]
                .map((k,i)=>(<div className="kpi" key={i}><div className="n">{k.n}</div><div className="t">{k.t}</div></div>))}
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
            <div className="card" style={{marginBottom:16}}>
              <div className="hd"><h3>筛选与模型</h3></div>
              <div className="bd">
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
            
            <div className="card card-no-border">
              <div className="hd"><h3>来源与参考</h3></div>
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
          <button className="btn" onClick={()=>{
            try {
              // 创建 Canvas 元素
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              
              // 设置画布尺寸 - 适应主流手机屏幕 (9:16比例)
              canvas.width = 1080;
              canvas.height = 1920;
              
              // 根据当前主题设置颜色
              const colors = themeLight ? {
                bg: '#f7f9fc',
                text: '#0f1624',
                muted: '#5b6780',
                brand: '#2667ff',
                accent: '#1aa6b7',
                card: '#ffffff',
                border: '#e9eef7',
                shadow: '#e1e8f0',
                highlight: '#f0f4ff'
              } : {
                bg: '#0b0f16',
                text: '#e6ecff',
                muted: '#9fb0cf',
                brand: '#5aa9ff',
                accent: '#7ef0ff',
                card: '#0f1624',
                border: '#1a2132',
                shadow: '#050a12',
                highlight: '#1a2132'
              };
              
              // 绘制复杂渐变背景
              const bgGradient = ctx.createRadialGradient(canvas.width * 0.8, 0, 0, canvas.width * 0.8, 0, canvas.height);
              bgGradient.addColorStop(0, colors.brand + '15');
              bgGradient.addColorStop(0.5, colors.accent + '08');
              bgGradient.addColorStop(1, colors.bg);
              ctx.fillStyle = bgGradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // 绘制顶部装饰区域
              const topGradient = ctx.createLinearGradient(0, 0, 0, 120);
              topGradient.addColorStop(0, colors.brand);
              topGradient.addColorStop(1, colors.accent);
              ctx.fillStyle = topGradient;
              ctx.fillRect(0, 0, canvas.width, 120);
              
              // 绘制顶部装饰图案
              ctx.fillStyle = colors.bg + '20';
              for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(200 + i * 150, 60, 30 + i * 10, 0, Math.PI * 2);
                ctx.fill();
              }
              
              // 绘制主标题区域
              ctx.fillStyle = colors.card;
              ctx.shadowColor = colors.shadow;
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 10;
              ctx.fillRect(40, 80, canvas.width - 80, 160);
              ctx.shadowBlur = 0;
              
              // 绘制标题
              ctx.fillStyle = colors.text;
              ctx.font = 'bold 80px system-ui, -apple-system, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('AI 产品每日简报', canvas.width / 2, 160);
              
              // 绘制日期
              ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = colors.muted;
              ctx.fillText(fmtDate(brief.date || new Date().toISOString()), canvas.width / 2, 210);
              
              // 绘制要点区域
              ctx.fillStyle = colors.card;
              ctx.shadowColor = colors.shadow;
              ctx.shadowBlur = 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 8;
              ctx.fillRect(40, 280, canvas.width - 80, 140);
              ctx.shadowBlur = 0;
              
              // 绘制要点图标
              ctx.fillStyle = colors.brand;
              ctx.beginPath();
              ctx.arc(80, 320, 25, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = colors.text;
              ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('💡', 80, 335);
              
              ctx.font = 'bold 60px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = colors.text;
              ctx.fillText('今日要点', canvas.width / 2, 320);
              
              ctx.font = '44px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = colors.muted;
              const headline = brief.headline || '今日要点';
              const maxWidth = canvas.width - 160;
              if (ctx.measureText(headline).width > maxWidth) {
                const words = headline.split('');
                let line = '';
                let y = 370;
                for (let char of words) {
                  if (ctx.measureText(line + char).width > maxWidth) {
                    ctx.fillText(line, canvas.width / 2, y);
                    line = char;
                    y += 55;
                  } else {
                    line += char;
                  }
                }
                if (line) ctx.fillText(line, canvas.width / 2, y);
              } else {
                ctx.fillText(headline, canvas.width / 2, 370);
              }
              
              // 绘制统计信息卡片
              ctx.fillStyle = colors.card;
              ctx.shadowColor = colors.shadow;
              ctx.shadowBlur = 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 8;
              ctx.fillRect(40, 460, canvas.width - 80, 120);
              ctx.shadowBlur = 0;
              
              // 绘制统计图标
              ctx.fillStyle = colors.accent;
              ctx.beginPath();
              ctx.arc(80, 500, 25, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = colors.text;
              ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('📊', 80, 515);
              
              ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = colors.text;
              ctx.fillText('今日统计', canvas.width / 2, 500);
              
              ctx.font = '40px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = colors.muted;
              const statsText = `条目: ${total} | 新发布: ${counts.new || 0} | 更新: ${counts.update || 0}`;
              ctx.fillText(statsText, canvas.width / 2, 540);
              
              // 绘制条目列表
              let yPos = 640;
              const maxItems = Math.min(6, brief.items.length);
              
              for (let i = 0; i < maxItems; i++) {
                const item = brief.items[i];
                if (yPos > canvas.height - 300) break;
                
                // 绘制条目卡片背景
                ctx.fillStyle = colors.card;
                ctx.shadowColor = colors.shadow;
                ctx.shadowBlur = 12;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 6;
                ctx.fillRect(40, yPos, canvas.width - 80, 160);
                ctx.shadowBlur = 0;
                
                // 绘制条目类型标签（渐变）
                const labelGradient = ctx.createLinearGradient(60, yPos + 20, 180, yPos + 60);
                labelGradient.addColorStop(0, colors.brand);
                labelGradient.addColorStop(1, colors.accent);
                ctx.fillStyle = labelGradient;
                ctx.fillRect(60, yPos + 20, 120, 40);
                
                // 绘制标签圆角
                ctx.fillStyle = colors.card;
                ctx.beginPath();
                ctx.arc(60, yPos + 40, 20, Math.PI / 2, Math.PI * 3 / 2);
                ctx.arc(180, yPos + 40, 20, -Math.PI / 2, Math.PI / 2);
                ctx.fill();
                
                ctx.fillStyle = colors.text;
                ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(item.type.toUpperCase(), 120, yPos + 48);
                
                // 绘制产品名称
                ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
                ctx.fillStyle = colors.text;
                ctx.textAlign = 'left';
                ctx.fillText(item.product, 200, yPos + 55);
                
                // 绘制条目描述
                ctx.font = '36px system-ui, -apple-system, sans-serif';
                ctx.fillStyle = colors.muted;
                const desc = item.summary;
                const maxDescWidth = canvas.width - 240;
                
                if (ctx.measureText(desc).width > maxDescWidth) {
                  // 文本换行处理
                  const words = desc.split('');
                  let line = '';
                  let lineY = yPos + 100;
                  let lineCount = 0;
                  
                  for (let char of words) {
                    if (ctx.measureText(line + char).width > maxDescWidth) {
                      ctx.fillText(line, 200, lineY);
                      line = char;
                      lineY += 45;
                      lineCount++;
                      if (lineCount >= 2) break; // 最多2行
                    } else {
                      line += char;
                    }
                  }
                  if (line && lineCount < 2) {
                    ctx.fillText(line, 200, lineY);
                  }
                } else {
                  ctx.fillText(desc, 200, yPos + 100);
                }
                
                yPos += 180;
              }
              
              // 绘制底部装饰区域
              const bottomGradient = ctx.createLinearGradient(0, canvas.height - 120, 0, canvas.height);
              bottomGradient.addColorStop(0, colors.brand + '20');
              bottomGradient.addColorStop(1, colors.brand);
              ctx.fillStyle = bottomGradient;
              ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
              
              // 绘制底部装饰图案
              ctx.fillStyle = colors.bg + '30';
              for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(canvas.width - 150 - i * 100, canvas.height - 60, 20 + i * 15, 0, Math.PI * 2);
                ctx.fill();
              }
              
              // 绘制二维码区域背景（圆角矩形）
              const qrSize = 140;
              const qrX = canvas.width / 2 - qrSize / 2;
              const qrY = canvas.height - 280;
              const qrRadius = 25;
              
              // 绘制圆角矩形背景
              ctx.fillStyle = colors.card;
              ctx.shadowColor = colors.shadow;
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 10;
              ctx.beginPath();
              ctx.moveTo(qrX + qrRadius, qrY);
              ctx.lineTo(qrX + qrSize - qrRadius, qrY);
              ctx.quadraticCurveTo(qrX + qrSize, qrY, qrX + qrSize, qrY + qrRadius);
              ctx.lineTo(qrX + qrSize, qrY + qrSize - qrRadius);
              ctx.quadraticCurveTo(qrX + qrSize, qrY + qrSize, qrX + qrSize - qrRadius, qrY + qrSize);
              ctx.lineTo(qrX + qrRadius, qrY + qrSize);
              ctx.quadraticCurveTo(qrX, qrY + qrSize, qrX, qrY + qrSize - qrRadius);
              ctx.lineTo(qrX, qrY + qrRadius);
              ctx.quadraticCurveTo(qrX, qrY, qrX + qrRadius, qrY);
              ctx.closePath();
              ctx.fill();
              ctx.shadowBlur = 0;
              
              // 绘制二维码边框
              ctx.strokeStyle = colors.border;
              ctx.lineWidth = 4;
              ctx.stroke();
              
              // 绘制真正的二维码（基于SVG数据）
              const qrUrl = 'https://ainext.weavex.top/';
              
              // SVG中的矩形位置数据（从SVG解析得出）
              const qrRectangles = [
                // 第一行 (y=24)
                {x: 0, y: 0}, {x: 12, y: 0}, {x: 24, y: 0}, {x: 36, y: 0}, {x: 48, y: 0}, {x: 60, y: 0}, {x: 72, y: 0}, {x: 84, y: 0}, {x: 96, y: 0}, {x: 120, y: 0}, {x: 168, y: 0}, {x: 192, y: 0}, {x: 204, y: 0}, {x: 228, y: 0}, {x: 276, y: 0}, {x: 288, y: 0}, {x: 300, y: 0}, {x: 312, y: 0}, {x: 336, y: 0}, {x: 348, y: 0}, {x: 360, y: 0}, {x: 372, y: 0}, {x: 384, y: 0}, {x: 396, y: 0}, {x: 408, y: 0},
                // 第二行 (y=36)
                {x: 0, y: 12}, {x: 96, y: 12}, {x: 156, y: 12}, {x: 180, y: 12}, {x: 204, y: 12}, {x: 216, y: 12}, {x: 240, y: 12}, {x: 288, y: 12}, {x: 300, y: 12}, {x: 336, y: 12}, {x: 408, y: 12},
                // 第三行 (y=48)
                {x: 0, y: 24}, {x: 48, y: 24}, {x: 60, y: 24}, {x: 72, y: 24}, {x: 96, y: 24}, {x: 144, y: 24}, {x: 156, y: 24}, {x: 168, y: 24}, {x: 192, y: 24}, {x: 216, y: 24}, {x: 228, y: 24}, {x: 240, y: 24}, {x: 288, y: 24}, {x: 300, y: 24}, {x: 312, y: 24}, {x: 336, y: 24}, {x: 360, y: 24}, {x: 372, y: 24}, {x: 384, y: 24}, {x: 408, y: 24},
                // 第四行 (y=60)
                {x: 0, y: 36}, {x: 48, y: 36}, {x: 60, y: 36}, {x: 72, y: 36}, {x: 96, y: 36}, {x: 120, y: 36}, {x: 144, y: 36}, {x: 156, y: 36}, {x: 180, y: 36}, {x: 204, y: 36}, {x: 216, y: 36}, {x: 228, y: 36}, {x: 240, y: 36}, {x: 252, y: 36}, {x: 288, y: 36}, {x: 312, y: 36}, {x: 336, y: 36}, {x: 360, y: 36}, {x: 372, y: 36}, {x: 384, y: 36}, {x: 408, y: 36},
                // 第五行 (y=72)
                {x: 0, y: 48}, {x: 48, y: 48}, {x: 60, y: 48}, {x: 72, y: 48}, {x: 96, y: 48}, {x: 132, y: 48}, {x: 144, y: 48}, {x: 156, y: 48}, {x: 192, y: 48}, {x: 204, y: 48}, {x: 216, y: 48}, {x: 228, y: 48}, {x: 252, y: 48}, {x: 264, y: 48}, {x: 276, y: 48}, {x: 312, y: 48}, {x: 336, y: 48}, {x: 360, y: 48}, {x: 372, y: 48}, {x: 384, y: 48}, {x: 408, y: 48},
                // 第六行 (y=84)
                {x: 0, y: 60}, {x: 96, y: 60}, {x: 132, y: 60}, {x: 156, y: 60}, {x: 216, y: 60}, {x: 228, y: 60}, {x: 240, y: 60}, {x: 288, y: 60}, {x: 300, y: 60}, {x: 312, y: 60}, {x: 336, y: 60}, {x: 408, y: 60},
                // 第七行 (y=96)
                {x: 0, y: 72}, {x: 36, y: 72}, {x: 48, y: 72}, {x: 60, y: 72}, {x: 72, y: 72}, {x: 84, y: 72}, {x: 96, y: 72}, {x: 108, y: 72}, {x: 120, y: 72}, {x: 168, y: 72}, {x: 180, y: 72}, {x: 192, y: 72}, {x: 216, y: 72}, {x: 228, y: 72}, {x: 240, y: 72}, {x: 312, y: 72}, {x: 324, y: 72}, {x: 336, y: 72}, {x: 360, y: 72}, {x: 372, y: 72}, {x: 408, y: 72},
                // 第八行 (y=108)
                {x: 0, y: 84}, {x: 48, y: 84}, {x: 84, y: 84}, {x: 96, y: 84}, {x: 108, y: 84}, {x: 120, y: 84}, {x: 144, y: 84}, {x: 180, y: 84}, {x: 216, y: 84}, {x: 252, y: 84}, {x: 264, y: 84}, {x: 276, y: 84}, {x: 396, y: 84}, {x: 408, y: 84},
                // 第九行 (y=120)
                {x: 36, y: 96}, {x: 48, y: 96}, {x: 120, y: 96}, {x: 132, y: 96}, {x: 144, y: 96}, {x: 192, y: 96}, {x: 228, y: 96}, {x: 264, y: 96}, {x: 276, y: 96}, {x: 288, y: 96}, {x: 312, y: 96}, {x: 324, y: 96}, {x: 360, y: 96}, {x: 384, y: 96}, {x: 408, y: 96},
                // 第十行 (y=132)
                {x: 36, y: 108}, {x: 48, y: 108}, {x: 60, y: 108}, {x: 108, y: 108}, {x: 132, y: 108}, {x: 144, y: 108}, {x: 156, y: 108}, {x: 204, y: 108}, {x: 228, y: 108}, {x: 240, y: 108}, {x: 252, y: 108}, {x: 264, y: 108}, {x: 288, y: 108}, {x: 312, y: 108}, {x: 336, y: 108}, {x: 372, y: 108}, {x: 396, y: 108}, {x: 408, y: 108},
                // 第十一行 (y=144)
                {x: 36, y: 120}, {x: 60, y: 120}, {x: 144, y: 120}, {x: 156, y: 120}, {x: 204, y: 120}, {x: 216, y: 120}, {x: 300, y: 120}, {x: 312, y: 120}, {x: 372, y: 120}, {x: 384, y: 120}, {x: 396, y: 120}, {x: 408, y: 120},
                // 第十二行 (y=156)
                {x: 36, y: 132}, {x: 48, y: 132}, {x: 60, y: 132}, {x: 72, y: 132}, {x: 84, y: 132}, {x: 96, y: 132}, {x: 108, y: 132}, {x: 120, y: 132}, {x: 168, y: 132}, {x: 180, y: 132}, {x: 192, y: 132}, {x: 216, y: 132}, {x: 228, y: 132}, {x: 240, y: 132}, {x: 312, y: 132}, {x: 324, y: 132}, {x: 336, y: 132}, {x: 360, y: 132}, {x: 372, y: 132}, {x: 408, y: 132},
                // 第十三行 (y=168)
                {x: 0, y: 144}, {x: 48, y: 144}, {x: 84, y: 144}, {x: 96, y: 144}, {x: 108, y: 144}, {x: 120, y: 144}, {x: 144, y: 144}, {x: 180, y: 144}, {x: 192, y: 144}, {x: 216, y: 144}, {x: 252, y: 144}, {x: 264, y: 144}, {x: 276, y: 144}, {x: 396, y: 144}, {x: 408, y: 144},
                // 第十四行 (y=180)
                {x: 0, y: 156}, {x: 36, y: 156}, {x: 48, y: 156}, {x: 120, y: 156}, {x: 132, y: 156}, {x: 144, y: 156}, {x: 156, y: 156}, {x: 180, y: 156}, {x: 192, y: 156}, {x: 204, y: 156}, {x: 216, y: 156}, {x: 264, y: 156}, {x: 336, y: 156}, {x: 360, y: 156}, {x: 384, y: 156}, {x: 396, y: 156}, {x: 408, y: 156},
                // 第十五行 (y=192)
                {x: 0, y: 168}, {x: 60, y: 168}, {x: 72, y: 168}, {x: 84, y: 168}, {x: 96, y: 168}, {x: 108, y: 168}, {x: 120, y: 168}, {x: 144, y: 168}, {x: 156, y: 168}, {x: 168, y: 168}, {x: 180, y: 168}, {x: 204, y: 168}, {x: 228, y: 168}, {x: 240, y: 168}, {x: 264, y: 168}, {x: 276, y: 168}, {x: 288, y: 168}, {x: 312, y: 168}, {x: 324, y: 168}, {x: 336, y: 168}, {x: 360, y: 168}, {x: 372, y: 168}, {x: 408, y: 168},
                // 第十六行 (y=204)
                {x: 36, y: 180}, {x: 48, y: 180}, {x: 120, y: 180}, {x: 132, y: 180}, {x: 144, y: 180}, {x: 192, y: 180}, {x: 228, y: 180}, {x: 264, y: 180}, {x: 276, y: 180}, {x: 288, y: 180}, {x: 300, y: 180}, {x: 312, y: 180}, {x: 324, y: 180}, {x: 360, y: 180}, {x: 384, y: 180}, {x: 396, y: 180}, {x: 408, y: 180},
                // 第十七行 (y=216)
                {x: 0, y: 192}, {x: 60, y: 192}, {x: 72, y: 192}, {x: 84, y: 192}, {x: 96, y: 192}, {x: 108, y: 192}, {x: 120, y: 192}, {x: 144, y: 192}, {x: 156, y: 192}, {x: 168, y: 192}, {x: 180, y: 192}, {x: 204, y: 192}, {x: 228, y: 192}, {x: 240, y: 192}, {x: 264, y: 192}, {x: 276, y: 192}, {x: 288, y: 192}, {x: 336, y: 192}, {x: 348, y: 192}, {x: 384, y: 192}, {x: 408, y: 192},
                // 第十八行 (y=228)
                {x: 0, y: 204}, {x: 36, y: 204}, {x: 60, y: 204}, {x: 72, y: 204}, {x: 108, y: 204}, {x: 120, y: 204}, {x: 144, y: 204}, {x: 156, y: 204}, {x: 216, y: 204}, {x: 228, y: 204}, {x: 240, y: 204}, {x: 264, y: 204}, {x: 276, y: 204}, {x: 288, y: 204}, {x: 336, y: 204}, {x: 348, y: 204}, {x: 360, y: 204}, {x: 384, y: 204}, {x: 396, y: 204}, {x: 408, y: 204},
                // 第十九行 (y=240)
                {x: 36, y: 216}, {x: 48, y: 216}, {x: 60, y: 216}, {x: 72, y: 216}, {x: 84, y: 216}, {x: 96, y: 216}, {x: 108, y: 216}, {x: 120, y: 216}, {x: 132, y: 216}, {x: 156, y: 216}, {x: 168, y: 216}, {x: 192, y: 216}, {x: 204, y: 216}, {x: 216, y: 216}, {x: 240, y: 216}, {x: 276, y: 216}, {x: 312, y: 216}, {x: 324, y: 216}, {x: 360, y: 216}, {x: 408, y: 216},
                // 第二十行 (y=252)
                {x: 0, y: 228}, {x: 60, y: 228}, {x: 84, y: 228}, {x: 96, y: 228}, {x: 108, y: 228}, {x: 132, y: 228}, {x: 156, y: 228}, {x: 168, y: 228}, {x: 180, y: 228}, {x: 228, y: 228}, {x: 252, y: 228}, {x: 264, y: 228}, {x: 276, y: 228}, {x: 288, y: 228}, {x: 312, y: 228}, {x: 324, y: 228}, {x: 360, y: 228}, {x: 384, y: 228}, {x: 396, y: 228}, {x: 408, y: 228},
                // 第二十一行 (y=264)
                {x: 48, y: 240}, {x: 96, y: 240}, {x: 156, y: 240}, {x: 180, y: 240}, {x: 204, y: 240}, {x: 216, y: 240}, {x: 228, y: 240}, {x: 240, y: 240}, {x: 276, y: 240}, {x: 312, y: 240}, {x: 336, y: 240}, {x: 372, y: 240}, {x: 396, y: 240}, {x: 408, y: 240},
                // 第二十二行 (y=276)
                {x: 36, y: 252}, {x: 84, y: 252}, {x: 108, y: 252}, {x: 120, y: 252}, {x: 132, y: 252}, {x: 144, y: 252}, {x: 156, y: 252}, {x: 168, y: 252}, {x: 204, y: 252}, {x: 240, y: 252}, {x: 264, y: 252}, {x: 276, y: 252}, {x: 300, y: 252}, {x: 312, y: 252}, {x: 372, y: 252}, {x: 384, y: 252}, {x: 396, y: 252}, {x: 408, y: 252},
                // 第二十三行 (y=288)
                {x: 0, y: 264}, {x: 96, y: 264}, {x: 108, y: 264}, {x: 132, y: 264}, {x: 144, y: 264}, {x: 180, y: 264}, {x: 192, y: 264}, {x: 240, y: 264}, {x: 252, y: 264}, {x: 288, y: 264}, {x: 300, y: 264}, {x: 312, y: 264}, {x: 336, y: 264}, {x: 372, y: 264}, {x: 384, y: 264}, {x: 396, y: 264}, {x: 408, y: 264},
                // 第二十四行 (y=300)
                {x: 36, y: 276}, {x: 48, y: 276}, {x: 60, y: 276}, {x: 72, y: 276}, {x: 84, y: 276}, {x: 96, y: 276}, {x: 132, y: 276}, {x: 180, y: 276}, {x: 204, y: 276}, {x: 216, y: 276}, {x: 240, y: 276}, {x: 276, y: 276}, {x: 312, y: 276}, {x: 324, y: 276}, {x: 360, y: 276}, {x: 408, y: 276},
                // 第二十五行 (y=312)
                {x: 0, y: 288}, {x: 60, y: 288}, {x: 84, y: 288}, {x: 96, y: 288}, {x: 108, y: 288}, {x: 132, y: 288}, {x: 156, y: 288}, {x: 168, y: 288}, {x: 180, y: 288}, {x: 228, y: 288}, {x: 252, y: 288}, {x: 276, y: 288}, {x: 288, y: 288}, {x: 300, y: 288}, {x: 312, y: 288}, {x: 324, y: 288}, {x: 336, y: 288}, {x: 348, y: 288}, {x: 360, y: 288}, {x: 396, y: 288}, {x: 408, y: 288},
                // 第二十六行 (y=324)
                {x: 120, y: 300}, {x: 132, y: 300}, {x: 144, y: 300}, {x: 180, y: 300}, {x: 192, y: 300}, {x: 204, y: 300}, {x: 216, y: 300}, {x: 276, y: 300}, {x: 312, y: 300}, {x: 360, y: 300}, {x: 396, y: 300}, {x: 408, y: 300},
                // 第二十七行 (y=336)
                {x: 0, y: 312}, {x: 36, y: 312}, {x: 48, y: 312}, {x: 60, y: 312}, {x: 72, y: 312}, {x: 84, y: 312}, {x: 96, y: 312}, {x: 132, y: 312}, {x: 144, y: 312}, {x: 156, y: 312}, {x: 168, y: 312}, {x: 180, y: 312}, {x: 204, y: 312}, {x: 228, y: 312}, {x: 240, y: 312}, {x: 288, y: 312}, {x: 300, y: 312}, {x: 312, y: 312}, {x: 336, y: 312}, {x: 348, y: 312}, {x: 360, y: 312}, {x: 396, y: 312}, {x: 408, y: 312},
                // 第二十八行 (y=348)
                {x: 0, y: 324}, {x: 96, y: 324}, {x: 120, y: 324}, {x: 144, y: 324}, {x: 204, y: 324}, {x: 216, y: 324}, {x: 252, y: 324}, {x: 264, y: 324}, {x: 276, y: 324}, {x: 288, y: 324}, {x: 312, y: 324}, {x: 360, y: 324}, {x: 408, y: 324},
                // 第二十九行 (y=360)
                {x: 0, y: 336}, {x: 48, y: 336}, {x: 60, y: 336}, {x: 72, y: 336}, {x: 96, y: 336}, {x: 120, y: 336}, {x: 180, y: 336}, {x: 216, y: 336}, {x: 228, y: 336}, {x: 240, y: 336}, {x: 264, y: 336}, {x: 288, y: 336}, {x: 312, y: 336}, {x: 324, y: 336}, {x: 336, y: 336}, {x: 348, y: 336}, {x: 360, y: 336}, {x: 396, y: 336}, {x: 408, y: 336},
                // 第三十行 (y=372)
                {x: 0, y: 348}, {x: 48, y: 348}, {x: 60, y: 348}, {x: 72, y: 348}, {x: 96, y: 348}, {x: 132, y: 348}, {x: 180, y: 348}, {x: 204, y: 348}, {x: 216, y: 348}, {x: 264, y: 348}, {x: 288, y: 348}, {x: 300, y: 348}, {x: 312, y: 348}, {x: 360, y: 348}, {x: 372, y: 348}, {x: 408, y: 348},
                // 第三十一行 (y=384)
                {x: 0, y: 360}, {x: 48, y: 360}, {x: 60, y: 360}, {x: 72, y: 360}, {x: 96, y: 360}, {x: 120, y: 360}, {x: 132, y: 360}, {x: 144, y: 360}, {x: 168, y: 360}, {x: 192, y: 360}, {x: 216, y: 360}, {x: 240, y: 360}, {x: 252, y: 360}, {x: 264, y: 360}, {x: 276, y: 360}, {x: 300, y: 360}, {x: 324, y: 360}, {x: 348, y: 360}, {x: 360, y: 360}, {x: 372, y: 360}, {x: 384, y: 360}, {x: 408, y: 360},
                // 第三十二行 (y=396)
                {x: 0, y: 372}, {x: 96, y: 372}, {x: 132, y: 372}, {x: 144, y: 372}, {x: 156, y: 372}, {x: 168, y: 372}, {x: 192, y: 372}, {x: 240, y: 372}, {x: 252, y: 372}, {x: 312, y: 372}, {x: 324, y: 372}, {x: 336, y: 372}, {x: 348, y: 372}, {x: 372, y: 372}, {x: 396, y: 372}, {x: 408, y: 372},
                // 第三十三行 (y=408)
                {x: 0, y: 384}, {x: 48, y: 384}, {x: 60, y: 384}, {x: 72, y: 384}, {x: 96, y: 384}, {x: 120, y: 384}, {x: 132, y: 384}, {x: 144, y: 384}, {x: 168, y: 384}, {x: 192, y: 384}, {x: 216, y: 384}, {x: 240, y: 384}, {x: 252, y: 384}, {x: 264, y: 384}, {x: 276, y: 384}, {x: 300, y: 384}, {x: 324, y: 384}, {x: 348, y: 384}, {x: 360, y: 384}, {x: 372, y: 384}, {x: 384, y: 384}, {x: 408, y: 384},
                // 第三十四行 (y=420)
                {x: 0, y: 396}, {x: 96, y: 396}, {x: 132, y: 396}, {x: 144, y: 396}, {x: 156, y: 396}, {x: 168, y: 396}, {x: 192, y: 396}, {x: 240, y: 396}, {x: 252, y: 396}, {x: 312, y: 396}, {x: 324, y: 396}, {x: 336, y: 396}, {x: 348, y: 396}, {x: 372, y: 396}, {x: 396, y: 396}, {x: 408, y: 396},
                // 第三十五行 (y=432)
                {x: 0, y: 408}, {x: 36, y: 408}, {x: 48, y: 408}, {x: 60, y: 408}, {x: 72, y: 408}, {x: 84, y: 408}, {x: 96, y: 408}, {x: 156, y: 408}, {x: 168, y: 408}, {x: 180, y: 408}, {x: 192, y: 408}, {x: 216, y: 408}, {x: 252, y: 408}, {x: 264, y: 408}, {x: 300, y: 408}, {x: 312, y: 408}, {x: 336, y: 408}, {x: 348, y: 408}, {x: 360, y: 408}, {x: 372, y: 408}, {x: 384, y: 408}, {x: 408, y: 408}
              ];
              
              // 计算缩放比例（SVG是432x432，目标尺寸是140x140）
              const scale = qrSize / 432;
              
              // 绘制二维码
              ctx.fillStyle = colors.text;
              qrRectangles.forEach(rect => {
                ctx.fillRect(
                  qrX + rect.x * scale + 12,
                  qrY + rect.y * scale + 12,
                  scale * 12 - 2,
                  scale * 12 - 2
                );
              });
              
              // 绘制二维码说明文字
              ctx.font = '32px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = colors.text;
              ctx.textAlign = 'center';
              ctx.fillText('Scan to visit', canvas.width / 2, qrY + qrSize + 50);
              
              // 绘制版权信息（英文）
              ctx.font = '36px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = colors.text;
              ctx.textAlign = 'center';
              ctx.fillText('Designed & Built by Haynes Fang', canvas.width / 2, canvas.height - 80);
              
              // 创建下载链接
              const link = document.createElement('a');
              link.download = `AI-brief-${brief.date?.replace(/-/g,'')}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              
            } catch (error) {
              console.error('导出图片失败:', error);
              alert('导出图片失败，请稍后重试');
            }
          }}>导出为图片</button>
        </div>

        {/* ✅ 页脚注脚（很小的字） */}
        <div className="footer">
          注：本页面自动汇总公开来源的更新信息，每天早上9点更新，仅用于学习与研究，不构成任何商业承诺或投资建议。
          <div style={{marginTop: '8px', opacity: 0.6}}>
            由 Haynes Fang 设计并搭建
          </div>
        </div>
      </div>
      
      {/* 图片预览模态框 */}
      {showPreview && previewImage && (
        <div className="preview-modal">
          <div className="preview-content">
            <button 
              className="preview-close"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </button>
            <img 
              src={previewImage} 
              alt="AI简报预览图" 
              className="preview-image"
            />
            <div className="preview-actions">
              <button 
                className="btn" 
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `AI-brief-${brief?.date?.replace(/-/g,'') || 'preview'}.png`;
                  link.href = previewImage;
                  link.click();
                }}
              >
                下载图片
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}