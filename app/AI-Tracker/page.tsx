'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateAIBriefImage } from '../utils/imageGenerator';
import ColorfulModelIcon from '../components/ColorfulModelIcon';
import UnifiedMenu from '../components/UnifiedMenu';
import { getColor } from '../utils/themeColors';

type Item = {
  product: string;
  type: 'new'|'update'|'feedback'|'fix';
  summary: string;
  tags?: string[];
  sources?: {name:string; url:string}[];
  time?: string;
};
type Brief = { date: string; headline: string; items: Item[]; };

/** —— 产品元信息：名称 + Lobe Icons 专业品牌图标 —— */
const PRODUCT_META: Record<string, { label: string; icon: React.ReactElement }> = {
  'ChatGPT': { label: 'ChatGPT', icon: <ColorfulModelIcon model="ChatGPT" size={16} /> },
  'Claude': { label: 'Claude', icon: <ColorfulModelIcon model="Claude" size={16} /> },
  'Gemini': { label: 'Gemini', icon: <ColorfulModelIcon model="Gemini" size={16} /> },
  'LLaMA': { label: 'LLaMA', icon: <ColorfulModelIcon model="LLaMA" size={16} /> },
  'Mistral': { label: 'Mistral', icon: <ColorfulModelIcon model="Mistral" size={16} /> },
  'Grok': { label: 'Grok', icon: <ColorfulModelIcon model="Grok" size={16} /> },
  'Copilot': { label: 'Copilot', icon: <ColorfulModelIcon model="Copilot" size={16} /> },
  '文心一言': { label: '文心一言', icon: <ColorfulModelIcon model="文心一言" size={16} /> },
  '通义千问': { label: '通义千问', icon: <ColorfulModelIcon model="通义千问" size={16} /> },
  '豆包': { label: '豆包', icon: <ColorfulModelIcon model="豆包" size={16} /> },
  '讯飞星火': { label: '讯飞星火', icon: <ColorfulModelIcon model="讯飞星火" size={16} /> },
  'Kimi': { label: 'Kimi', icon: <ColorfulModelIcon model="Kimi" size={16} /> },
};

const styles = `
:root{
  --bg:#1c1c1e; --panel:#2c2c2e; --panel-2:#3a3a3c; --text:#ffffff; --muted:#8e8e93;
  --brand:#5aa9ff; --accent:#7ef0ff; --ok:#63f3a6; --warn:#ffd166; --bad:#ff6b6b; --chip:#3a3a3c;
  --border:#38383a;
  --shadow:none;
  --radius:16px;
}
.light{ --bg:#f7f9fc; --panel:#ffffff; --panel-2:#f0f3f9; --text:#0f1624; --muted:#5b6780; --brand:#5aa9ff; --accent:#1aa6b7; --chip:#e9eef7; --border:#e5e7eb; --shadow:none; }
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

/* 浅色模式下的背景渐变调整 */
.light html{background:var(--bg)}
.light body{
  background:
    radial-gradient(800px 400px at 50% -100px, rgba(90,169,255,.06), transparent 70%),
    radial-gradient(600px 400px at 50% -50px, rgba(126,240,255,.04), transparent 70%),
    var(--bg);
  overflow-x: hidden;
}

/* 导航栏样式重置 - 确保不受主页样式影响 */
nav, nav * {
  box-sizing: border-box;
  font-family: system-ui,-apple-system,Segoe UI,Roboto,PingFang SC,"Microsoft YaHei",Helvetica,Arial,"Noto Sans",sans-serif;
}

.wrap{max-width:1100px; margin:48px auto; padding:0 20px; background:var(--bg)}
.page-header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:22px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:13px}
.actions{display:flex; gap:8px; flex-wrap:wrap}
@media (max-width: 600px){.actions{gap:6px; flex-wrap:wrap; justify-content:space-between} .btn{padding:10px 16px; font-size:13px; flex:1; min-width:0; text-align:center; gap:6px}}
.btn{appearance:none; border:none; background:var(--panel-2); color:var(--muted); padding:12px 20px; border-radius:12px; cursor:pointer; transition:all 0.2s ease; font-weight:600; text-decoration:none; display:flex; align-items:center; gap:8px; font-size:14px}
.btn:hover{transform:translateY(-1px)} .btn:active{transform:translateY(0)}

.hero-content{display:block; margin-bottom:18px}

.hero-header{display:flex; align-items:center; justify-content:space-between; margin-bottom:6px}
.hero-title{display:flex; align-items:center}
.hero-actions{display:flex; gap:8px; align-items:center}
.btn-icon{display:flex; align-items:center; justify-content:center; background:var(--panel-2); border:none; border-radius:12px; padding:8px; cursor:pointer; transition:all 0.2s ease; color:var(--text); width:40px; height:40px}
.btn-icon:hover{transform:translateY(-1px)}
.btn-icon svg{width:16px; height:16px; color:var(--brand)}
.hero h1{margin:0 0 6px; font-size:28px; letter-spacing:.2px}
.update-time{color:var(--muted); font-size:13px; margin-bottom:8px; opacity:.8}
.hero p{margin:0; color:var(--muted)}
.date{font-feature-settings:"tnum" 1, "cv01" 1; opacity:.9}
.kpis{display:flex; gap:12px; margin-top:12px; flex-wrap:wrap}
.kpi{flex:1; min-width:0; border:none; background:var(--panel-2); border-radius:14px; padding:12px; text-align:center}
.kpi .n{font-size:20px; font-weight:800} .kpi .t{font-size:11px; color:var(--muted)}
@media (max-width: 600px){.kpis{gap:8px} .kpi{padding:10px} .kpi .n{font-size:18px} .kpi .t{font-size:10px}}

.grid{display:grid; grid-template-columns:repeat(12,1fr); gap:16px; margin-top:18px}
.col-8{grid-column:span 8} .col-4{grid-column:span 4}
@media (max-width: 900px){.col-8,.col-4{grid-column:1 / -1}}
@media (max-width: 600px){.wrap{padding:0 16px; margin:32px auto} .hero h1{font-size:24px} .hero-title{gap:10px} .bottom-actions{flex-direction:row; align-items:center; gap:8px; justify-content:center} .bottom-actions .btn{min-width:120px; max-width:200px}}
@media (max-width: 480px){.actions{gap:4px} .btn{padding:6px 10px; font-size:12px} .hero-header{gap:8px} .hero-actions{gap:6px} .btn-icon{width:36px; height:36px} .bottom-actions{gap:6px} .bottom-actions .btn{min-width:100px; max-width:160px}}

.card{border:none; background:var(--panel); border-radius:var(--radius)}
.card-no-border{border:none; background:transparent; box-shadow:none}
.card h3{margin:0; font-size:16px}
.card .hd{display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px dashed var(--border)}
.card .bd{padding:10px 8px 14px}

.feed{display:flex; flex-direction:column; gap:10px}
.item{display:grid; grid-template-columns: 24px 1fr auto; gap:12px; padding:10px 10px; border-radius:12px; border:1px solid transparent}
.item:hover{border-color:var(--border); background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0))}
.ico{width:24px; height:24px; display:grid; place-items:center; border-radius:8px; background:var(--chip);}
.chg{display:inline-flex; align-items:center; gap:6px; font-size:12px; padding:4px 8px; border-radius:999px; border:none; background:var(--chip)}
.prod{font-weight:700} .desc{color:var(--muted)}
.tags{display:flex; gap:6px; flex-wrap:wrap}
.tag{font-size:11px; color:var(--muted); padding:4px 8px; border-radius:999px; border:none; background:var(--chip)}
.meta{display:flex; align-items:center; gap:10px; color:var(--muted); font-size:12px}
.sources{display:flex; gap:8px; flex-wrap:wrap}
.src{font-size:12px; color:var(--brand); text-decoration:none; border-bottom:1px dashed rgba(90,169,255,.4)}

.filterbar{display:flex; gap:8px; flex-wrap:wrap}
.pill{padding:8px 12px; border-radius:999px; background:var(--panel-2); border:none; cursor:pointer; font-size:13px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s ease; color:var(--text)}
@media (max-width: 600px){.filterbar{gap:6px} .pill{padding:6px 10px; font-size:12px}}
.pill:hover{transform:translateY(-1px)}
.pill.active{background:var(--brand); color:white; border-color:var(--brand)}
.pill.toggle-more{background:var(--muted); color:var(--text); border-color:var(--muted); opacity:0.8}
.pill.toggle-more:hover{background:var(--brand); color:white; border-color:var(--brand); opacity:1}

.bottom-actions{display:flex; gap:16px; margin-top:32px; margin-bottom:48px; justify-content:center; flex-wrap:wrap}
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

export default function TestNewsPage(){
  const [brief, setBrief] = useState<Brief|null>(null);
  const [filter, setFilter] = useState<string>('全部');
  const [showAllModels, setShowAllModels] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(()=>{ 
    console.log('开始获取数据...');
    
    // 设置超时，避免长时间等待
    const timeoutId = setTimeout(() => {
      console.log('API请求超时，使用本地数据');
      const testData: Brief = {
        date: new Date().toISOString().slice(0, 10),
        headline: "AI产品每日动态更新",
        items: [
          {
            product: "ChatGPT",
            type: "update" as const,
            summary: "ChatGPT新增多模态理解能力,支持视频内容分析。",
            tags: ["多模态", "视频理解"],
            sources: [{ name: "OpenAI Blog", url: "https://openai.com" }],
            time: new Date().toISOString()
          },
          {
            product: "Gemini",
            type: "new" as const,
            summary: "Gemini推出实时协作功能,支持多人同时编辑对话。",
            tags: ["协作", "实时编辑"],
            sources: [{ name: "Google AI", url: "https://ai.google" }],
            time: new Date().toISOString()
          },
          {
            product: "LLaMA",
            type: "fix" as const,
            summary: "修复了LLaMA在长文本生成中的重复内容问题。",
            tags: ["长文本", "修复"],
            sources: [{ name: "Meta AI", url: "https://ai.meta.com" }],
            time: new Date().toISOString()
          },
          {
            product: "Copilot",
            type: "feedback" as const,
            summary: "Copilot集成了新的代码自动补全模型,提高开发效率。",
            tags: ["代码补全", "开发效率"],
            sources: [{ name: "Microsoft", url: "https://microsoft.com" }],
            time: new Date().toISOString()
          }
        ]
      };
      setBrief(testData);
    }, 3000); // 3秒超时
    
    // 先尝试从API获取数据
    fetch('/api/brief')
      .then(r => {
        console.log('API响应状态:', r.status);
        clearTimeout(timeoutId); // 清除超时
        return r.json();
      })
      .then(data => {
        console.log('获取到的数据:', data);
        setBrief(data);
      })
      .catch(error => {
        console.error('获取数据失败:', error);
        clearTimeout(timeoutId); // 清除超时
        
        // 如果API失败，使用硬编码的测试数据
        console.log('使用硬编码测试数据');
        const testData: Brief = {
          date: new Date().toISOString().slice(0, 10),
          headline: "AI产品每日动态更新",
          items: [
            {
              product: "ChatGPT",
              type: "update" as const,
              summary: "ChatGPT新增多模态理解能力,支持视频内容分析。",
              tags: ["多模态", "视频理解"],
              sources: [{ name: "OpenAI Blog", url: "https://openai.com" }],
              time: new Date().toISOString()
            },
            {
              product: "Gemini",
              type: "new" as const,
              summary: "Gemini推出实时协作功能,支持多人同时编辑对话。",
              tags: ["协作", "实时编辑"],
              sources: [{ name: "Google AI", url: "https://ai.google" }],
            },
            {
              product: "LLaMA",
              type: "fix" as const,
              summary: "修复了LLaMA在长文本生成中的重复内容问题。",
              tags: ["长文本", "修复"],
              sources: [{ name: "Meta AI", url: "https://ai.meta.com" }],
              time: new Date().toISOString()
            },
            {
              product: "Copilot",
              type: "feedback" as const,
              summary: "Copilot集成了新的代码自动补全模型,提高开发效率。",
              tags: ["代码补全", "开发效率"],
              sources: [{ name: "Microsoft", url: "https://microsoft.com" }],
              time: new Date().toISOString()
            }
          ]
        };
        setBrief(testData);
      });
  },[]);

  // 图片生成函数
  const generateImage = () => {
    console.log('开始生成图片...', { brief: !!brief, counts });
    try {
      generateAIBriefImage({
        brief,
        counts,
        onDownload: (filename) => {
          console.log(`图片已下载: ${filename}`);
        }
      });
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

  if (!brief) return (
    <div style={{
      padding: '40px 20px', 
      textAlign: 'center', 
      color: getColor.text(isLightTheme),
      background: getColor.bg(isLightTheme),
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 骨架屏加载效果 */}
      <div style={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        backgroundImage: `linear-gradient(90deg, ${getColor.bgCard(isLightTheme)} 25%, ${getColor.bgHover(isLightTheme)} 50%, ${getColor.bgCard(isLightTheme)} 75%)`,
        backgroundSize: '200% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        animation: 'loading 1.5s infinite',
        marginBottom: '24px'
      }}></div>
      <div style={{fontSize: '20px', marginBottom: '12px', fontWeight: '600'}}>AI Tracker 加载中</div>
      <div style={{fontSize: '14px', color: getColor.textMuted(isLightTheme), marginBottom: '24px'}}>正在获取最新的AI产品动态数据...</div>
      
      {/* 进度指示器 */}
      <div style={{
        width: '300px',
        height: '4px',
        background: getColor.bgCard(isLightTheme),
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{
          height: '100%',
          backgroundImage: `linear-gradient(90deg, ${getColor.primary()}, ${getColor.hover(isLightTheme)})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          borderRadius: '2px',
          animation: 'progress 2s ease-in-out infinite'
        }}></div>
      </div>
      
      <div style={{fontSize: '12px', color: getColor.textMuted(isLightTheme), marginBottom: '20px'}}>预计需要 3-5 秒</div>
      <div style={{fontSize: '11px', color: getColor.textMuted(isLightTheme), opacity: 0.7, textAlign: 'center', maxWidth: '300px'}}>
        💡 首次访问需要编译，后续访问会更快
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        style={{
          padding: '12px 24px',
          background: getColor.primary(),
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        重新加载
      </button>
      
      <style jsx>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );

  const counts = brief.items.reduce((acc:any,it)=>{acc[it.type]=(acc[it.type]||0)+1; return acc;},{} as Record<string,number>);
  const total = brief.items.length;
  const allSources = new Map<string,string>();
  brief.items.forEach(it=> (it.sources||[]).forEach(s=> allSources.set(s.url, s.name)) );

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
        onSearchChange={setSearchTerm}
        showCategoryFilter={false}
      />
      
      <div className="wrap">
        <div className="hero-content">
          <div>
            <div className="hero-header">
              <div className="hero-title">
                <h1>AI Tracker</h1>
              </div>
              <div className="hero-actions">
                <a className="btn-icon" href="/archive" title="查看归档">
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="bevel">
                    <rect x="6" y="6" width="36" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="bevel"/>
                    <path d="M4 31H15L17 35H31L33 31H44" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="bevel"/>
                    <path d="M42 36V26" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="bevel"/>
                    <path d="M6 36V26" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="bevel"/>
                    <path d="M17 15H31" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="bevel"/>
                    <path d="M17 23H31" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="bevel"/>
                  </svg>
                </a>
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
                      style={{display: 'flex', alignItems: 'center', gap: '6px'}}
                    >
                      <ColorfulModelIcon model={p} size={14} />
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
                
                {/* 在模型筛选器和类型筛选器之间添加分割线 */}
                <div style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
                  margin: '16px 0'
                }}></div>
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
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            复制为 Markdown
          </button>
          <button className="btn" onClick={()=>{
            const blob = new Blob([document.documentElement.outerHTML], {type:'text/html;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `AI-brief-${brief.date?.replace(/-/g,'')}.html`; a.click(); URL.revokeObjectURL(url);
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            导出 HTML
          </button>
          <button className="btn" onClick={() => generateImage()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            导出为图片
          </button>
        </div>

        {/* ✅ 页脚注脚（居中对齐，一排显示，字号统一，字重200） */}
        <div className="footer" style={{
          fontSize: '12px', 
          lineHeight: '1.4', 
          color: 'var(--muted)', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontWeight: '200'
        }}>
          <span style={{fontWeight: '200'}}>注：本页面自动汇总公开来源的更新信息，每天早上9点更新，仅用于学习与研究，不构成任何商业承诺或投资建议。</span>
          <span style={{fontWeight: '200'}}>由 Haynes Fang 设计并搭建</span>
        </div>
      </div>
    </div>
  );
}
