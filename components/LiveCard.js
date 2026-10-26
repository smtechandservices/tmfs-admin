'use client';

import { useEffect, useState } from 'react';
import Card from './ui/Card';

/** Visitors active in the last five minutes, polled every 15s while the tab is visible. */
export default function LiveCard({ initial, siteUrl }) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await fetch('/api/live', { cache: 'no-store' });
        if (res.ok && !stop) setData(await res.json());
      } catch {}
    };
    const t = setInterval(tick, 15000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  return (
    <Card title="Live on the website" subtitle="Active in the last 5 minutes" className="flex flex-col">
      <div className="flex items-center gap-[12px]">
        <span className="relative flex h-[12px] w-[12px]">
          {data.visitors > 0 && <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: 'var(--status-good)' }} />}
          <span className="relative h-[12px] w-[12px] rounded-full" style={{ background: data.visitors > 0 ? 'var(--status-good)' : 'var(--line-strong)' }} />
        </span>
        <span className="text-[44px] leading-none font-semibold tracking-[-.03em] text-ink">{data.visitors}</span>
        <span className="text-[13px] text-ink-2">{data.visitors === 1 ? 'visitor now' : 'visitors now'}</span>
      </div>
      <ul className="mt-[18px] flex flex-col gap-[2px]">
        {data.pages.length === 0 && <li className="text-[12.5px] text-ink-muted">Nobody is browsing right now.</li>}
        {data.pages.map((p) => (
          <li key={p.path} className="flex items-center justify-between gap-[10px] border-t border-line py-[7px] text-[13px] first:border-t-0">
            <a href={`${siteUrl}${p.path}`} target="_blank" rel="noopener" className="truncate text-ink hover:text-brand-ink hover:underline">
              {p.path}
            </a>
            <span className="tabular flex-none font-semibold text-ink">{p.visitors}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
