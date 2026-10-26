import Link from 'next/link';
import Empty from '../ui/Empty';
import { num } from '@/lib/format';

/**
 * Ranked list with a thin magnitude bar under each label. Every value is
 * printed as text, so the bars only add the at-a-glance comparison.
 *
 * rows: [{ key, label, href?, external?, prefix?, value, cols?: [..] }]
 */
export default function BarList({ rows, valueLabel, colLabels = [], format = num, empty = 'No data for this period', emptyIcon }) {
  if (!rows?.length) return <Empty icon={emptyIcon} title={empty} />;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const grid = { gridTemplateColumns: `minmax(0,1fr) repeat(${colLabels.length + 1}, minmax(52px, auto))` };
  return (
    <div className="text-[13px]">
      <div className="mb-[6px] grid gap-x-[14px] text-[11.5px] font-medium text-ink-muted" style={grid}>
        <span />
        <span className="text-right">{valueLabel}</span>
        {colLabels.map((c) => (
          <span key={c} className="text-right">{c}</span>
        ))}
      </div>
      <ul className="flex flex-col">
        {rows.map((r) => {
          const label = (
            <span className="flex min-w-0 items-center gap-[7px]">
              {r.prefix && <span className="flex-none">{r.prefix}</span>}
              <span className="truncate" title={r.title || r.label}>{r.label}</span>
            </span>
          );
          return (
            <li key={r.key ?? r.label} className="grid items-center gap-x-[14px] rounded-[6px] py-[6px]" style={grid}>
              <div className="min-w-0">
                {r.href ? (
                  <Link href={r.href} target={r.external ? '_blank' : undefined} className="block min-w-0 text-ink hover:text-brand-ink hover:underline">
                    {label}
                  </Link>
                ) : (
                  <div className="text-ink">{label}</div>
                )}
                <div className="mt-[5px] h-[4px] rounded-full bg-surface-2">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(1.5, (r.value / max) * 100)}%`, background: 'var(--series-1)' }} />
                </div>
              </div>
              <span className="tabular text-right font-semibold text-ink">{format(r.value)}</span>
              {(r.cols || []).map((c, i) => (
                <span key={i} className="tabular text-right text-ink-2">{c}</span>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
