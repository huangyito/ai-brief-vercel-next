'use client';

import { useEffect, useState } from 'react';

export default function BriefByDate({ params }: { params: { date: string } }){
  const { date } = params;
  const [data, setData] = useState<any>(null);
  useEffect(()=>{ fetch(`/api/brief/${date}`).then(r=>r.json()).then(setData); },[date]);

  if (!data) return <div style={{padding:20}}>加载中…</div>;

  return (
    <div style={{maxWidth:1100, margin:'40px auto', padding:'0 16px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{margin:0}}>简报 · {date}</h1>
        <a href="/archive" style={{opacity:.8}}>返回归档</a>
      </div>
      <div style={{marginTop:12, opacity:.75}}>{data.headline || '—'}</div>
      <div style={{marginTop:18, display:'grid', gap:12}}>
        {data.items?.map((it:any, i:number)=>(
          <div key={i} style={{border:'1px solid rgba(255,255,255,.12)', borderRadius:12, padding:12}}>
            <div style={{fontWeight:700, display:'flex', alignItems:'center', gap:8}}>
              <span>{it.product}</span>
              <span style={{fontSize:12, opacity:.7}}>[{String(it.type).toUpperCase()}]</span>
            </div>
            <div style={{opacity:.85, marginTop:6}}>{it.summary}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:11, opacity:.7, marginTop:24}}>注：汇总公开来源，仅用于学习研究。</div>
    </div>
  );
}
