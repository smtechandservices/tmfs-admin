export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-[20px] flex flex-wrap items-end justify-between gap-[14px]">
      <div className="min-w-0">
        <h1 className="font-display text-[24px] font-bold tracking-[-.03em] text-brand-ink max-md:text-[21px]">{title}</h1>
        {subtitle && <p className="mt-[4px] text-[13.5px] text-ink-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex max-w-full min-w-0 flex-wrap items-center gap-[8px]">{children}</div>}
    </div>
  );
}
