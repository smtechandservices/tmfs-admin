import Link from 'next/link';
import { RANGES } from '@/lib/ranges';

/** Date-range presets as links; keeps every other search param. */
export default function RangeTabs({ current, params = {}, path }) {
  return (
    <nav aria-label="Date range" className="flex max-w-full overflow-x-auto rounded-[9px] border border-line bg-surface p-[3px]">
      {RANGES.map((r) => {
        const q = new URLSearchParams({ ...params, range: r.key });
        const active = r.key === current;
        return (
          <Link
            key={r.key}
            href={`${path}?${q}`}
            aria-current={active ? 'true' : undefined}
            className={`rounded-[6px] px-[11px] py-[6px] text-[12.5px] font-semibold whitespace-nowrap ${active ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}
          >
            {r.label}
          </Link>
        );
      })}
    </nav>
  );
}
