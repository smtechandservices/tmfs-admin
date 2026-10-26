'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { bucketLabel, compact, num } from '@/lib/format';

// Time series as lines (2px, first series with a 10% area wash) or columns
// (≤ 24px, 4px rounded data-end). One y-axis, recessive hairline grid, a
// crosshair that snaps to the nearest bucket and one tooltip listing every
// series. Arrow keys move the crosshair; a table view sits underneath.

const M = { top: 12, right: 12, bottom: 26, left: 40 };

function niceMax(v) {
  if (v <= 4) return 4;
  const raw = v / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw);
  return step * 4;
}

function columnPath(x, y, w, base) {
  const h = base - y;
  if (h <= 0) return '';
  const r = Math.min(4, w / 2, h);
  return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${base}Z`;
}

export default function TimeChart({ data, series, unit = 'day', type = 'line', height = 230, format = num, area = true, label }) {
  const wrap = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);
  const id = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = data.length;
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;
  const max = niceMax(Math.max(0, ...data.flatMap((d) => series.map((s) => d[s.key] ?? 0))));
  const y = (v) => M.top + innerH - (v / max) * innerH;
  const band = innerW / Math.max(n, 1);
  const x = (i) => (type === 'column' ? M.left + band * i + band / 2 : M.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW));
  const ticks = [0, 1, 2, 3, 4].map((t) => (max / 4) * t);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 74))));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = type === 'column' ? Math.floor((px - M.left) / band) : Math.round(((px - M.left) / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setHover((h) => Math.min(n - 1, Math.max(0, (h ?? (e.key === 'ArrowRight' ? -1 : n)) + (e.key === 'ArrowRight' ? 1 : -1))));
    } else if (e.key === 'Escape') setHover(null);
  };

  const colW = Math.min(24, band * 0.62) / Math.max(1, series.length);
  const hx = hover !== null ? x(hover) : 0;
  const tipLeft = hover !== null && hx > width - 180;

  return (
    <div className="min-w-0">
      {series.length > 1 && (
        <ul className="mb-[10px] flex flex-wrap gap-x-[16px] gap-y-[4px] text-[12px] text-ink-2">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-[7px]">
              {type === 'column' ? (
                <span className="h-[10px] w-[10px] rounded-[2px]" style={{ background: s.color }} />
              ) : (
                <span className="h-[2px] w-[14px] rounded-full" style={{ background: s.color }} />
              )}
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div ref={wrap} className="relative">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={label || series.map((s) => s.label).join(' and ')}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className="block max-w-full touch-pan-y focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--brand-ink)]"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'var(--axis)' : 'var(--grid)'} strokeWidth="1" />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="tabular fill-[var(--ink-muted)] text-[11px]">
                {compact(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % labelEvery === 0 ? (
              <text key={d.k} x={x(i)} y={height - 8} textAnchor="middle" className="fill-[var(--ink-muted)] text-[11px]">
                {bucketLabel(d.k, unit)}
              </text>
            ) : null,
          )}

          {type === 'column' &&
            data.map((d, i) =>
              series.map((s, si) => {
                const left = x(i) - (colW * series.length) / 2 + si * colW;
                return (
                  <path
                    key={`${d.k}-${s.key}`}
                    d={columnPath(left + (series.length > 1 ? 1 : 0), y(d[s.key] ?? 0), colW - (series.length > 1 ? 2 : 0), y(0))}
                    fill={s.color}
                    opacity={hover === null || hover === i ? 1 : 0.55}
                  />
                );
              }),
            )}

          {type === 'line' &&
            series.map((s, si) => {
              const pts = data.map((d, i) => `${x(i)},${y(d[s.key] ?? 0)}`);
              return (
                <g key={s.key}>
                  {area && si === 0 && n > 1 && (
                    <path d={`M${x(0)},${y(0)}L${pts.join('L')}L${x(n - 1)},${y(0)}Z`} fill={s.wash || 'var(--series-1-wash)'} />
                  )}
                  <path d={`M${pts.join('L')}`} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                </g>
              );
            })}

          {hover !== null && (
            <g pointerEvents="none">
              {type === 'line' && <line x1={hx} x2={hx} y1={M.top} y2={y(0)} stroke="var(--axis)" strokeWidth="1" />}
              {type === 'line' &&
                series.map((s) => <circle key={s.key} cx={hx} cy={y(data[hover][s.key] ?? 0)} r="4.5" fill={s.color} stroke="var(--surface)" strokeWidth="2" />)}
            </g>
          )}
          <rect
            x={M.left}
            y={M.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && (
          <div
            role="status"
            className="pointer-events-none absolute top-[4px] z-10 min-w-[150px] rounded-[8px] border border-line bg-surface px-[11px] py-[9px] shadow-[0_14px_32px_rgba(10,37,64,.1)]"
            style={tipLeft ? { right: width - hx + 12 } : { left: hx + 12 }}
          >
            <div className="mb-[6px] text-[11.5px] font-medium text-ink-muted">{bucketLabel(data[hover].k, unit, true)}</div>
            {series.map((s) => (
              <div key={s.key} className="flex items-center gap-[8px] text-[12.5px]">
                <span className="h-[2px] w-[12px] flex-none rounded-full" style={{ background: s.color }} />
                <span className="tabular font-semibold text-ink">{format(data[hover][s.key] ?? 0)}</span>
                <span className="text-ink-2">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <details className="mt-[8px] text-[12px]">
        <summary className="cursor-pointer text-ink-muted select-none hover:text-ink">View as table</summary>
        <div className="relative mt-[8px] max-h-[260px] overflow-auto rounded-[8px] border border-line">
          <table className="w-full text-left text-[12.5px]" aria-describedby={id}>
            <thead className="sticky top-0 bg-surface-2 text-ink-2">
              <tr>
                <th className="px-[10px] py-[6px] font-semibold">{unit === 'hour' ? 'Hour' : unit === 'month' ? 'Month' : 'Date'}</th>
                {series.map((s) => (
                  <th key={s.key} className="px-[10px] py-[6px] text-right font-semibold">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.k} className="border-t border-line">
                  <td className="px-[10px] py-[5px] text-ink-2">{bucketLabel(d.k, unit, true)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="tabular px-[10px] py-[5px] text-right text-ink">{format(d[s.key] ?? 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <span id={id} className="sr-only">{label}</span>
        </div>
      </details>
    </div>
  );
}
