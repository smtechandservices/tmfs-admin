import Link from 'next/link';
import Card from '@/components/ui/Card';
import Empty from '@/components/ui/Empty';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/ui/PageHeader';
import FilterBar from '@/components/FilterBar';
import { BTN_SECONDARY } from '@/components/ui/styles';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { ago, dateTime, num } from '@/lib/format';

export const metadata = { title: 'Inbox' };

const STATUS = { sent: ['Sent', 'text-good'], failed: ['Failed', 'text-bad'] };
const KIND = { notification: 'Website notification', reply: 'CRM reply' };

export default async function InboxPage({ searchParams }) {
  await requireUser();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, stats, pageSize: PAGE } = await api('/api/inbox', { query: { q: sp.q, kind: sp.kind, status: sp.status, page } });
  const qs = (extra) => new URLSearchParams({ ...Object.fromEntries(['q', 'kind', 'status'].filter((k) => sp[k]).map((k) => [k, sp[k]])), ...extra });

  return (
    <>
      <PageHeader title="Inbox" subtitle="Every email sent: website enquiry notifications and CRM replies" />
      <div className="mb-[14px] grid grid-cols-4 gap-[14px] max-lg:grid-cols-2">
        {[
          ['Sent, 30 days', stats.sent],
          ['Website notifications', stats.notifications],
          ['CRM replies', stats.replies],
          ['Failed, 30 days', stats.failed],
        ].map(([label, n]) => (
          <div key={label} className="rounded-[12px] border border-line bg-surface px-[16px] py-[13px]">
            <div className="text-[12.5px] text-ink-2">{label}</div>
            <div className="mt-[6px] text-[22px] font-semibold text-ink">{num(n)}</div>
          </div>
        ))}
      </div>
      <div className="mb-[14px]">
        <FilterBar
          action="/inbox"
          values={sp}
          search="Search subject, address or message"
          fields={[
            { name: 'kind', label: 'Type', options: [['', 'All email'], ['reply', 'CRM replies'], ['notification', 'Website notifications']] },
            { name: 'status', label: 'Status', options: [['', 'Any status'], ['sent', 'Sent'], ['failed', 'Failed']] },
          ]}
        />
      </div>
      <Card bodyClass="">
        {rows.length === 0 ? (
          <Empty icon="inbox" title="No email yet">
            Website enquiry notifications and emails sent from a lead appear here. Client replies go to your mailbox.
          </Empty>
        ) : (
          <ul>
            {rows.map((e) => {
              const [label, toneClass] = STATUS[e.status] || [e.status, 'text-ink-muted'];
              return (
                <li key={e.id} className="border-b border-line last:border-b-0">
                  <details className="group">
                    <summary className="grid cursor-pointer list-none grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-[12px] px-[18px] py-[11px] hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-2 text-ink-2">
                        <Icon name="mail" size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-[8px]">
                          <span className="truncate text-[13px] font-semibold text-ink">To {e.to_addr}</span>
                          <span className="flex-none rounded-[5px] bg-surface-3 px-[6px] py-[1px] text-[11px] font-medium text-ink-2">{KIND[e.kind] || e.kind}</span>
                        </span>
                        <span className="block truncate text-[12.5px] text-ink-2">{e.subject || '(no subject)'}</span>
                      </span>
                      <span className="flex flex-col items-end gap-[3px] text-right">
                        <span className={`text-[11.5px] font-semibold ${toneClass}`}>{label}</span>
                        <span className="text-[11.5px] whitespace-nowrap text-ink-muted" title={dateTime(e.created_at)}>{ago(e.created_at)}</span>
                      </span>
                    </summary>
                    <div className="border-t border-line bg-surface-2 px-[18px] py-[14px] pl-[60px]">
                      <div className="mb-[10px] flex flex-wrap items-center gap-[10px] text-[12.5px] text-ink-2">
                        <span>{dateTime(e.created_at)}</span>
                        {e.user_name && <span>· by {e.user_name}</span>}
                        {e.lead_id && (
                          <Link href={`/leads/${e.lead_id}`} className="font-semibold text-brand-ink hover:underline">Open lead: {e.lead_name}</Link>
                        )}
                      </div>
                      {e.error && <p className="mb-[8px] text-[12.5px] text-bad">{e.error}</p>}
                      <pre className="max-h-[420px] overflow-auto rounded-[8px] border border-line bg-surface p-[12px] font-sans text-[12.5px] leading-[1.55] whitespace-pre-wrap text-ink">{e.body_text || '(no text body stored)'}</pre>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
        {total > PAGE && (
          <div className="flex items-center justify-between border-t border-line px-[18px] py-[11px] text-[12.5px] text-ink-2">
            <span>{num((page - 1) * PAGE + 1)}–{num(Math.min(total, page * PAGE))} of {num(total)}</span>
            <span className="flex gap-[8px]">
              {page > 1 && <Link href={`/inbox?${qs({ page: page - 1 })}`} className={BTN_SECONDARY}>Previous</Link>}
              {page * PAGE < total && <Link href={`/inbox?${qs({ page: page + 1 })}`} className={BTN_SECONDARY}>Next</Link>}
            </span>
          </div>
        )}
      </Card>
    </>
  );
}
