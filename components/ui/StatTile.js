import Icon from './Icon';

/**
 * label · value · delta vs the previous period. `upIsGood` sets whether a
 * rise reads as good (visitors) or bad (bounce rate). The arrow + sign carry
 * direction, so colour is never the only cue.
 */
export default function StatTile({ label, value, current, previous, upIsGood = true, hint }) {
  let delta = null;
  if (Number.isFinite(current) && Number.isFinite(previous)) {
    if (previous === 0) delta = current === 0 ? { text: 'No change', tone: 'flat' } : { text: 'New', tone: upIsGood ? 'good' : 'bad', up: true };
    else {
      const change = (current - previous) / previous;
      const up = change > 0;
      const flat = Math.abs(change) < 0.005;
      delta = {
        text: flat ? 'No change' : `${up ? '+' : '−'}${Math.abs(change * 100).toFixed(Math.abs(change) < 0.1 ? 1 : 0)}%`,
        tone: flat ? 'flat' : up === upIsGood ? 'good' : 'bad',
        up,
      };
    }
  }
  const tone = { good: 'text-good', bad: 'text-bad', flat: 'text-ink-muted' };
  return (
    <div className="min-w-0 rounded-[12px] border border-line bg-surface px-[18px] py-[16px]">
      <div className="truncate text-[12.5px] font-medium text-ink-2">{label}</div>
      <div className="mt-[8px] truncate text-[28px] leading-none font-semibold tracking-[-.02em] text-ink">{value}</div>
      <div className="mt-[10px] flex min-h-[18px] items-center gap-[6px] text-[12px]">
        {delta && (
          <span className={`inline-flex items-center gap-[3px] font-semibold ${tone[delta.tone]}`}>
            {delta.tone !== 'flat' && <Icon name="arrowRight" size={12} stroke={2.4} className={delta.up ? '-rotate-45' : 'rotate-45'} />}
            {delta.text}
          </span>
        )}
        <span className="truncate text-ink-muted" title={delta && !hint ? 'Compared with the previous period of the same length' : undefined}>{hint ?? (delta ? 'vs prior' : '')}</span>
      </div>
    </div>
  );
}
