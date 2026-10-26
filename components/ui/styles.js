// Shared class strings, so every button and field looks the same. They follow
// the website's buttons and form fields (6px corners, red focus ring).

export const BTN =
  'inline-flex h-[36px] cursor-pointer items-center justify-center gap-[7px] rounded-[6px] px-[14px] text-[13.5px] font-semibold tracking-[.01em] whitespace-nowrap transition-all duration-[250ms] ease-[cubic-bezier(.22,.61,.36,1)] disabled:cursor-not-allowed disabled:opacity-60';
export const BTN_PRIMARY = `${BTN} bg-brand text-white hover:bg-brand-hover hover:shadow-[0_8px_24px_rgba(24,0,173,.18)]`;
export const BTN_SECONDARY = `${BTN} border border-line-strong bg-surface text-brand-ink hover:border-brand-ink`;
export const BTN_GHOST = `${BTN} text-ink-2 hover:bg-surface-2 hover:text-ink`;
export const BTN_DANGER = `${BTN} border border-line-strong bg-surface text-bad hover:bg-accent-soft`;

export const FIELD =
  'h-[36px] w-full rounded-[6px] border border-line-strong bg-surface-2 px-[11px] text-[13.5px] text-ink transition-[border-color,background,box-shadow] duration-200 placeholder:text-ink-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-[var(--focus)]';
export const TEXTAREA = `${FIELD} h-auto min-h-[88px] py-[9px] leading-[1.5]`;
export const LABEL = 'mb-[6px] block text-[11px] font-bold tracking-[.12em] text-accent uppercase';
