'use client';

import { useEffect, useState } from 'react';

type Item = { product:string; type:string; summary:string; date?:string };

export default function ProductHistory({ params }: { params: { product: string } }){
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
    <div style={{maxWidth:900, margin:'40px auto', padding:'0 16px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{margin:0}}>{product} · 历史更新</h1>
        <a href="/archive" style={{opacity:.8}}>归档</a>
      </div>
      {loading ? <div style={{padding:20}}>加载中…</div> : (
        items.length === 0 ? <div style={{opacity:.7, marginTop:12}}>暂无记录</div> : (
          <div style={{display:'grid', gap:12, marginTop:14}}>
            {items.map((it, i)=>(
              <a key={i} href={`/brief/${it.date}`} style={{border:'1px solid rgba(255,255,255,.12)', padding:12, borderRadius:12, textDecoration:'none', color:'inherit'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div style={{fontWeight:700}}>[{String(it.type).toUpperCase()}] {it.summary}</div>
                  <div style={{opacity:.7, fontSize:12}}>{it.date}</div>
                </div>
              </a>
            ))}
          </div>
        )
      )}
      <div style={{fontSize:11, opacity:.7, marginTop:24}}>注：汇总公开来源，仅用于学习研究。</div>
    </div>
  );
}
