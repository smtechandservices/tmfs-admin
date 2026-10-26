import Icon from '../ui/Icon';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { dateTime } from '@/lib/format';

const ICONS = {
  created: 'inbox', note: 'note', call: 'phone', whatsapp: 'whatsapp', meeting: 'leads', status: 'arrowRight',
  assigned: 'leads', updated: 'note', email_out: 'mail',
};

const EMAIL_STATUS = { sent: 'Sent', failed: 'Failed' };
const BAD = new Set(['failed']);

function EmailItem({ item }) {
  const kind = item.meta?.kind;
  const title = kind === 'notification' ? `Website notification to ${item.to_addr}` : `Email to ${item.to_addr}`;
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[2px]">
        <span className="text-[13px] font-semibold text-ink">{title}</span>
        {item.status && (
          <span className={`inline-flex items-center gap-[4px] text-[11.5px] font-semibold ${BAD.has(item.status) ? 'text-bad' : 'text-ink-2'}`}>
            {BAD.has(item.status) ? <Icon name="alert" size={12} stroke={2.4} /> : <Icon name="check" size={12} stroke={2.4} />}
            {EMAIL_STATUS[item.status] || item.status}
          </span>
        )}
      </div>
      {item.subject && <div className="mt-[2px] truncate text-[12.5px] text-ink-2">{item.subject}</div>}
      {item.error && <div className="mt-[2px] text-[12.5px] text-bad">{item.error}</div>}
      {item.body && (
        <details className="mt-[6px]">
          <summary className="cursor-pointer text-[12px] text-ink-muted select-none hover:text-ink">Show message</summary>
          <pre className="mt-[6px] max-h-[360px] overflow-auto rounded-[8px] bg-surface-2 p-[12px] font-sans text-[12.5px] leading-[1.55] whitespace-pre-wrap text-ink">{item.body}</pre>
        </details>
      )}
    </div>
  );
}

export default function Timeline({ items }) {
  return (
    <ol className="relative flex flex-col">
      {[...items].reverse().map((item, i, arr) => (
        <li key={`${item.kind}-${item.id}`} className="relative flex gap-[12px] pb-[18px] last:pb-0">
          {i < arr.length - 1 && <span className="absolute top-[30px] bottom-[2px] left-[14px] w-px bg-line" aria-hidden="true" />}
          <span className="flex h-[29px] w-[29px] flex-none items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2">
            <Icon name={ICONS[item.type] || 'note'} size={14} />
          </span>
          <div className="min-w-0 flex-1 pt-[4px]">
            {item.kind === 'email' ? (
              <EmailItem item={item} />
            ) : (
              <>
                <div className="text-[13px] font-semibold text-ink">
                  {item.type === 'status' || item.type === 'assigned' || item.type === 'updated' ? item.body : ACTIVITY_LABELS[item.type] || item.type}
                </div>
                {!['status', 'assigned', 'updated'].includes(item.type) && item.body && (
                  <p className="mt-[3px] text-[13px] leading-[1.55] whitespace-pre-wrap text-ink-2">{item.body}</p>
                )}
              </>
            )}
            <div className="mt-[4px] text-[11.5px] text-ink-muted">
              {dateTime(item.created_at)}
              {item.user_name ? ` · ${item.user_name}` : ''}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
