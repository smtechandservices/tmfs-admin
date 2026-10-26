import { statusOf } from '@/lib/constants';

export default function StatusPill({ status, className = '' }) {
  const s = statusOf(status);
  return (
    <span className={`inline-flex h-[22px] items-center gap-[6px] rounded-full border border-line bg-surface-2 px-[9px] text-[12px] font-medium whitespace-nowrap text-ink ${className}`}>
      <span className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
