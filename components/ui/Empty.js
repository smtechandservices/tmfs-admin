import Icon from './Icon';

export default function Empty({ icon = 'chart', title, children, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-[16px] py-[32px] text-center ${className}`}>
      <span className="mb-[10px] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-surface-2 text-ink-muted">
        <Icon name={icon} size={18} />
      </span>
      <div className="text-[13.5px] font-semibold text-ink">{title}</div>
      {children && <div className="mt-[4px] max-w-[46ch] text-[12.5px] leading-[1.55] text-ink-muted">{children}</div>}
    </div>
  );
}
