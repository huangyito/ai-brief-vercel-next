'use client';
import { useEffect, useState } from 'react';

export default function ArchivePage(){
  const [dates, setDates] = useState<string[]>([]);
  useEffect(()=>{ fetch('/api/dates').then(r=>r.json()).then(d=>setDates(d.dates||[])); },[]);
  return (
    <div style={{maxWidth:900, margin:'40px auto', padding:'0 16px'}}>
      <h1 style={{margin:'0 0 12px'}}>简报归档</h1>
      <div style={{opacity:.7, fontSize:14, marginBottom:16}}>从最近到最早 · 点击进入某天</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12}}>
        {dates.map(d=>(
          <a key={d} href={`/brief/${d}`} style={{border:'1px solid rgba(255,255,255,.12)', padding:'14px', borderRadius:12, textDecoration:'none', color:'inherit'}}>
            <div style={{fontWeight:700}}>{d}</div>
            <div style={{opacity:.7, fontSize:12}}>查看当日更新 →</div>
          </a>
        ))}
      </div>
    </div>
  );
}