export default function Card({ title, subtitle, action, children, className = '', bodyClass = 'p-[18px]' }) {
  return (
    <section className={`min-w-0 rounded-[12px] border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex min-h-[52px] items-center justify-between gap-[12px] border-b border-line px-[18px] py-[12px]">
          <div className="min-w-0">
            {title && <h2 className="truncate text-[14px] font-semibold text-brand-ink">{title}</h2>}
            {subtitle && <p className="mt-[2px] truncate text-[12px] text-ink-muted">{subtitle}</p>}
          </div>
          {action && <div className="flex flex-none items-center gap-[8px]">{action}</div>}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
