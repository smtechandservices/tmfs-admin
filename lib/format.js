// Display formatting. Dates always render in Dubai time, whatever the
// server's or browser's own timezone is.

const TZ = 'Asia/Dubai';

export function num(n) {
  return new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(n ?? 0);
}

export function compact(n) {
  n = Number(n ?? 0);
  if (Math.abs(n) < 1000) return num(n);
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function pct(x, digits = 1) {
  if (!Number.isFinite(x)) return '–';
  return `${(x * 100).toFixed(digits).replace(/\.0+$/, '')}%`;
}

export function aed(n) {
  if (n === null || n === undefined || n === '') return '–';
  return `AED ${new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(Number(n))}`;
}

export function duration(ms) {
  if (!ms) return '0s';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h ${m % 60}m` : `${Math.round(h / 24)}d`;
}

const fmt = (opts) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts });
const DATE = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
const DATE_SHORT = fmt({ day: 'numeric', month: 'short' });
const DATETIME = fmt({ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
const TIME = fmt({ hour: '2-digit', minute: '2-digit', hour12: false });

export const date = (d) => (d ? DATE.format(new Date(d)) : '–');
export const dateShort = (d) => (d ? DATE_SHORT.format(new Date(d)) : '–');
export const dateTime = (d) => (d ? DATETIME.format(new Date(d)) : '–');
export const time = (d) => (d ? TIME.format(new Date(d)) : '–');

export function ago(d) {
  if (!d) return '–';
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 0) return `in ${ago(Date.now() + s * 1000).replace(' ago', '')}`;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return date(d);
}

/** For <input type="datetime-local">, in Dubai time. */
export function toLocalInput(d) {
  if (!d) return '';
  const t = new Date(new Date(d).getTime() + 4 * 3600e3);
  return t.toISOString().slice(0, 16);
}
export function fromLocalInput(v) {
  if (!v) return null;
  return new Date(`${v}:00+04:00`);
}

/** Axis/tooltip label for a bucket key from tmfs-backend (YYYY-MM[-DD[ HH]]). */
export function bucketLabel(k, unit, long = false) {
  if (unit === 'hour') return `${k.slice(11, 13)}:00`;
  if (unit === 'month') {
    const [y, m] = k.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'short', year: long ? 'numeric' : '2-digit', timeZone: 'UTC' });
  }
  const [y, m, d] = k.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(long ? { weekday: 'short' } : {}), timeZone: 'UTC' });
}

let regionNames;
export function countryName(code) {
  if (!code || code === 'Unknown') return 'Unknown';
  try {
    regionNames ??= new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}
export function flag(code) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

export function waLink(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}
